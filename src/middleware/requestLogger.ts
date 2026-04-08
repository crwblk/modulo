import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Middleware to log HTTP requests with structured logging
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP Request", {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });
  });

  next();
};
