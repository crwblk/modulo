import { Router } from "express";
import { Storage } from "../storage/fs";
import { preventPathTraversal } from "../middleware/security";
import { cacheControl } from "../middleware/cache";
import { logger } from "../utils/logger";
import { getParam } from "../utils/params";
import { config } from "../config";

export const tarballRouter = Router();

tarballRouter.get(
  "/:package/-/:filename",
  preventPathTraversal,
  cacheControl(300),
  async (req, res, next) => {
    const pkgName = getParam(req.params, "package");
    const filename = getParam(req.params, "filename");

    try {
      const stream = Storage.getTarballStream(pkgName, filename);
      if (stream) {
        res.setHeader("Content-Type", "application/octet-stream");
        stream.pipe(res);
        return;
      }

      // Not found locally. Redirect to public registry for public packages (if proxy enabled)
      if (config.enablePublicProxy) {
        const NPM_REGISTRY = "https://registry.npmjs.org";
        const redirectUrl = `${NPM_REGISTRY}/${pkgName}/-/${filename}`;
        logger.debug(`Redirecting tarball request to ${redirectUrl}`, {
          requestId: req.id,
        });
        return res.redirect(redirectUrl);
      }

      // Proxy disabled - return 404
      return res.status(404).json({
        error: "Tarball not found",
        code: "NOT_FOUND",
      });
    } catch (error) {
      next(error);
    }
  },
);
