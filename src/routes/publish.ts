import { Router } from "express";
import { z } from "zod";
import { Storage } from "../storage/fs";
import { validateBody, validateParams } from "../middleware/validation";
import { preventPathTraversal } from "../middleware/security";
import { packageNameSchema, publishPayloadSchema } from "../validation/schemas";
import { logger } from "../utils/logger";
import { getParam } from "../utils/params";
import type { PublishPayload, PackageMetadata } from "../validation/schemas";
import rateLimit from "express-rate-limit";
import { config } from "../config";

const validateParamsSchema = z.object({
  package: packageNameSchema,
});

// Stricter rate limiting for publish endpoint
const publishLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.publishRateLimitMax,
  message: {
    error: "Too many publish requests, please try again later",
    code: "RATE_LIMITED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const publishRouter = Router();

publishRouter.put(
  "/:package",
  preventPathTraversal,
  publishLimiter,
  validateParams(validateParamsSchema),
  validateBody(publishPayloadSchema),
  async (req, res, next) => {
    const pkgName = getParam(req.params, "package");
    const payload = req.body as PublishPayload;

    // Track saved tarballs for cleanup on error
    const savedTarballs: string[] = [];

    try {
      // 1. Process attachments (tarballs)
      if (payload._attachments) {
        const attachments = payload._attachments;
        for (const filename in attachments) {
          const data = attachments[filename].data;
          const buffer = Buffer.from(data, "base64");
          await Storage.saveTarball(pkgName, filename, buffer);
          savedTarballs.push(filename);

          // Update distribution URLs for each version to point to our registry
          const localUrl = `${req.protocol}://${req.get("host")}/${pkgName}/-/${filename}`;

          for (const version in payload.versions) {
            const originalTarball = payload.versions[version].dist.tarball;
            // Extract just the filename from the tarball URL for exact matching
            const originalFilename = originalTarball.split("/").pop();
            if (originalFilename === filename) {
              payload.versions[version].dist.tarball = localUrl;
            }
          }
        }
      }

      // 2. Metadata merging/saving
      // We remove the attachments from metadata before saving it to avoid huge files
      const { _attachments, ...metadataWithoutAttachments } = payload;
      void _attachments; // We intentionally remove attachments from metadata

      const existing = await Storage.getPackageMetadata(pkgName);
      const now = new Date().toISOString();

      if (existing) {
        // Add timestamps for new versions
        const newVersionKeys = Object.keys(metadataWithoutAttachments.versions);

        // Update time metadata for new versions
        if (!existing.time) {
          existing.time = {
            created: now,
            modified: now,
          };
        }

        for (const version of newVersionKeys) {
          if (!existing.time[version]) {
            existing.time[version] = now;
          }
        }

        // Merge versions and tags
        existing.versions = {
          ...existing.versions,
          ...metadataWithoutAttachments.versions,
        };
        existing["dist-tags"] = {
          ...existing["dist-tags"],
          ...metadataWithoutAttachments["dist-tags"],
        };

        // Update basic info
        existing.description =
          metadataWithoutAttachments.description || existing.description;
        existing.readme = metadataWithoutAttachments.readme || existing.readme;
        existing.time.modified = now;

        await Storage.savePackageMetadata(pkgName, existing);
      } else {
        // For new packages, we need to provide required fields
        const firstVersion = Object.keys(metadataWithoutAttachments.versions)[0];
        const fullMetadata: PackageMetadata = {
          name: metadataWithoutAttachments.name,
          "dist-tags": metadataWithoutAttachments["dist-tags"] || {
            latest: firstVersion,
          },
          versions: metadataWithoutAttachments.versions,
          time: {
            created: now,
            modified: now,
            ...(firstVersion && { [firstVersion]: now }),
          },
          description: metadataWithoutAttachments.description,
          readme: metadataWithoutAttachments.readme,
        };
        await Storage.savePackageMetadata(pkgName, fullMetadata);
      }

      logger.info(`Published package ${pkgName}`, {
        requestId: req.id,
        versions: Object.keys(payload.versions),
      });
      return res.status(201).json({ ok: true });
    } catch (error) {
      // Cleanup: Remove tarballs if metadata save failed
      if (savedTarballs.length > 0) {
        logger.warn("Cleaning up tarballs after failed publish", {
          package: pkgName,
          tarballs: savedTarballs,
          requestId: req.id,
        });
        for (const filename of savedTarballs) {
          await Storage.deleteTarball(pkgName, filename).catch(() => { });
        }
      }
      next(error);
    }
  },
);
