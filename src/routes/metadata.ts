import { Router } from "express";
import { Storage } from "../storage/fs";
import { Proxy } from "../registry/proxy";
import { cacheControl } from "../middleware/cache";
import { preventPathTraversal } from "../middleware/security";
import { logger } from "../utils/logger";
import { getParam } from "../utils/params";
import { config } from "../config";
import type { PackageMetadata } from "../types";

export const metadataRouter = Router();

metadataRouter.get(
  "/:package",
  preventPathTraversal,
  cacheControl(60),
  async (req, res, next) => {
    const pkgName = getParam(req.params, "package");

    try {
      // 1. Check local storage
      const localMetadata = (await Storage.getPackageMetadata(
        pkgName,
      )) as PackageMetadata | null;
      if (localMetadata) {
        return res.json(localMetadata);
      }

      // 2. Fetch from proxy registry (if enabled)
      if (config.enablePublicProxy) {
        try {
          const proxyMetadata = await Proxy.fetchMetadata(pkgName);
          if (proxyMetadata) {
            return res.json(proxyMetadata);
          }
        } catch (error: unknown) {
          logger.error(`Error fetching metadata for ${pkgName}`, {
            error: error instanceof Error ? error.message : "Unknown error",
            requestId: req.id,
          });
          return res.status(502).json({
            error: "Failed to fetch from proxy registry",
            code: "PROXY_ERROR",
          });
        }
      }

      return res.status(404).json({
        error: "Not Found",
        code: "NOT_FOUND",
      });
    } catch (error) {
      next(error);
    }
  },
);
