import express, { Router } from "express";
import { metadataRouter } from "./metadata";
import { publishRouter } from "./publish";
import { tarballRouter } from "./tarball";
import { authRouter } from "./auth";
import { uiRouter } from "./ui";
import path from "node:path";
import { logger } from "../utils/logger";

export const router = Router();

// npm registry routes
router.use("/", authRouter);
router.use("/", publishRouter);
router.use("/", tarballRouter);
router.use("/", metadataRouter);

// UI backend routes
router.use("/-/ui", uiRouter);

// Serve the static files from the Vite build directory
const UI_DIST_DIR = path.resolve(process.cwd(), "ui", "dist");
router.use(express.static(UI_DIST_DIR));

// Fallback for single page application (SPA)
router.get("*splat", (req, res, next) => {
  // If it is an npm request (based on headers or format), skip
  if (req.headers["user-agent"]?.includes("npm")) {
    return next();
  }

  // If it is an internal UI request, treat as SPA
  res.sendFile(path.join(UI_DIST_DIR, "index.html"), (err) => {
    if (err) {
      // Log the actual error for debugging
      logger.error("Failed to serve UI index.html", { error: err.message });
      // Only return fallback if file genuinely doesn't exist (not built yet)
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === "ENOENT") {
        return res
          .status(200)
          .send(
            "<h1>Modulo npm Registry</h1><p>UI is being built. Please check back later.</p>",
          );
      }
      // For other errors (permissions, etc.), pass to error handler
      return next(err);
    }
  });
});
