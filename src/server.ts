import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from "fs-extra";
import path from "path";
import { router } from "./routes";
import { errorHandler } from "./middleware/error";
import { requestLogger } from "./middleware/requestLogger";
import { requestIdMiddleware } from "./middleware/requestId";
import { config } from "./config";
import { logger } from "./utils/logger";

export function createServer() {
  const app = express();

  // Trust proxy (for rate limiting with reverse proxies)
  app.set("trust proxy", 1);

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    message: {
      error: "Too many requests, please try again later",
      code: "RATE_LIMITED",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Custom parsing for npm payloads which are often large and have a specific format
  app.use(express.json({ limit: config.maxUploadSize }));
  app.use(bodyParser.urlencoded({ extended: true, limit: config.maxUploadSize }));

  // Request ID tracing
  app.use(requestIdMiddleware);

  // Request logger
  app.use(requestLogger);

  // Health check - liveness probe
  app.get("/-/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.0.1",
    });
  });

  // Health check - readiness probe (checks if storage is accessible)
  app.get("/-/ready", async (req, res) => {
    try {
      const storageDir = config.storageDir;
      await fs.access(path.join(storageDir, "metadata"));
      res.status(200).json({
        status: "ready",
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Storage not accessible", { error });
      res.status(503).json({
        status: "not ready",
        error: "Storage not accessible",
        code: "STORAGE_UNAVAILABLE",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Ping endpoint
  app.get("/-/ping", (_req, res) => {
    res.end("pong");
  });

  // Registry routes
  app.use("/", router);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
