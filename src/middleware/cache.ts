import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to add cache control headers for metadata responses
 */
export const cacheControl = (maxAgeSeconds: number = 60) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", `public, max-age=${maxAgeSeconds}`);
    next();
  };
};
