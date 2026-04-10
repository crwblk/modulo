import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

/**
 * Format ZodError issues into a human-readable message
 */
const formatValidationMessage = (error: ZodError): string => {
  return error.issues
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
};

/**
 * Middleware factory to validate request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = formatValidationMessage(error);
        return res.status(400).json({
          error: `Validation failed: ${message}`,
          code: "VALIDATION_ERROR",
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware factory to validate request params against a Zod schema
 */
export const validateParams = <T>(schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params) as T;
      Object.assign(req.params, validated);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = formatValidationMessage(error);
        return res.status(400).json({
          error: `Validation failed: ${message}`,
          code: "VALIDATION_ERROR",
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware factory to validate request query against a Zod schema
 */
export const validateQuery = <T>(schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query) as T;
      Object.assign(req.query, validated);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = formatValidationMessage(error);
        return res.status(400).json({
          error: `Validation failed: ${message}`,
          code: "VALIDATION_ERROR",
        });
      }
      next(error);
    }
  };
};
