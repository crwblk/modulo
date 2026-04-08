import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// Extend Express Request type to include id
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Middleware to add unique request ID for tracing
 * Uses X-Request-ID header if provided, otherwise generates UUID
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.id = req.headers["x-request-id"] as string || randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
};
