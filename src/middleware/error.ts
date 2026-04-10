import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { config } from "../config";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    code?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error code mapping for consistent API responses
 */
const ERROR_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
  502: "BAD_GATEWAY",
  503: "SERVICE_UNAVAILABLE",
};

/**
 * Get standardized error code from HTTP status code
 */
const getErrorCode = (statusCode: number): string => {
  return ERROR_CODES[statusCode] || "INTERNAL_ERROR";
};

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code || getErrorCode(err.statusCode),
    });
  }

  // Log the error for debugging
  logger.error("Unhandled error:", err);

  const statusCode = 500;
  return res.status(statusCode).json({
    error: "Internal Server Error",
    code: getErrorCode(statusCode),
    // Only include stack in development mode
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
};
