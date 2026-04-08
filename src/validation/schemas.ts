import { z } from "zod";

// Package name validation (npm spec compliant)
export const packageNameSchema = z
  .string()
  .min(1)
  .max(214)
  .regex(/^[a-z0-9][a-z0-9-_]*$/)
  .refine(
    (name) =>
      !name.startsWith("_") && !name.startsWith(".") && !name.startsWith("-"),
    "Package name cannot start with _, ., or -",
  )
  .refine(
    (name) => name === encodeURIComponent(name),
    "Package name must be URL-safe",
  );

// Version validation (semver)
export const semverSchema = z
  .string()
  .regex(/^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/);

// Dist metadata validation
export const distSchema = z.object({
  integrity: z.string().optional(),
  shasum: z.string(),
  tarball: z.string().url(),
  fileCount: z.number().optional(),
  unpackedSize: z.number().optional(),
});

// Single version validation
export const packageVersionSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  main: z.string().optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
  optionalDependencies: z.record(z.string(), z.string()).optional(),
  dist: distSchema,
  scripts: z.record(z.string(), z.string()).optional(),
  engines: z.record(z.string(), z.string()).optional(),
  gitHead: z.string().optional(),
  _id: z.string(),
  readme: z.string().optional(),
});

// Publish payload validation
export const publishPayloadSchema = z.object({
  _id: z.string().optional(),
  _rev: z.string().optional(),
  name: z.string(),
  "dist-tags": z.record(z.string(), z.string()).optional(),
  versions: z.record(z.string(), packageVersionSchema),
  _attachments: z
    .record(
      z.string(),
      z.object({
        content_type: z.string(),
        data: z.string(), // base64 encoded
        length: z.number(),
      }),
    )
    .optional(),
  description: z.string().optional(),
  readme: z.string().optional(),
  readmeFilename: z.string().optional(),
});

// Auth payload validation
export const authPayloadSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1).max(214),
  password: z.string().min(1),
});

// Search query validation
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(214).optional(),
  size: z.coerce.number().min(1).max(100).default(20).optional(),
  from: z.coerce.number().min(0).default(0).optional(),
});

export type PublishPayload = z.infer<typeof publishPayloadSchema>;
export type AuthPayload = z.infer<typeof authPayloadSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Re-export types from types/index.ts for convenience
export type { PackageMetadata, PackageVersion, PackageSummary } from "../types";
