import type { Request, Response, NextFunction } from "express";
import path from "path";

/**
 * Validates npm package name format
 * npm package names can only contain: lowercase letters, numbers, hyphens, underscores, dots
 * Must start with a letter or number
 */
export const isValidPackageName = (name: string): boolean => {
  return /^[a-z0-9][a-z0-9._-]*$/.test(name);
};

/**
 * Validates tarball filename format
 * Tarball filenames should only contain alphanumeric, hyphens, dots, underscores
 * Must end with .tgz
 */
export const isValidFilename = (name: string): boolean => {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.tgz$/.test(name);
};

/**
 * Middleware to prevent path traversal attacks
 */
export const preventPathTraversal = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramsToCheck = ["package", "filename", "name"];

  // Check route params
  for (const param of paramsToCheck) {
    const value = req.params[param];
    if (value && typeof value === "string") {
      if (hasPathTraversal(value)) {
        return res
          .status(400)
          .json({ error: "Invalid parameter: path traversal detected", code: "INVALID_INPUT" });
      }

      // Apply specific validation based on parameter type
      if (param === "package" || param === "name") {
        if (!isValidPackageName(value)) {
          return res
            .status(400)
            .json({ error: "Invalid package name format", code: "INVALID_INPUT" });
        }
      }

      if (param === "filename") {
        if (!isValidFilename(value)) {
          return res
            .status(400)
            .json({ error: "Invalid filename format", code: "INVALID_INPUT" });
        }
      }
    }
  }

  // Check query parameters that could contain file paths
  const queryToCheck = ["path", "file", "dir", "directory"];
  for (const param of queryToCheck) {
    const value = req.query[param];
    if (value && typeof value === "string" && hasPathTraversal(value)) {
      return res
        .status(400)
        .json({ error: "Invalid query parameter: path traversal detected", code: "INVALID_INPUT" });
    }
  }

  // Check body parameters that could contain file paths
  const bodyToCheck = ["path", "file", "dir", "directory", "filename"];
  if (req.body && typeof req.body === "object") {
    for (const param of bodyToCheck) {
      const value = req.body[param];
      if (value && typeof value === "string" && hasPathTraversal(value)) {
        return res
          .status(400)
          .json({ error: "Invalid body parameter: path traversal detected", code: "INVALID_INPUT" });
      }
    }
  }

  next();
};

/**
 * Helper to detect path traversal patterns in a string
 */
const hasPathTraversal = (value: string): boolean => {
  return (
    value.includes("..") ||
    value.includes("\\") ||
    value.startsWith("/") ||
    value !== path.normalize(value)
  );
};
