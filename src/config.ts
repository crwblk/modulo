import { z } from "zod";
import path from "path";

const configSchema = z.object({
  port: z.coerce.number().min(1).max(65535).default(4000),
  nodeEnv: z
    .enum(["development", "production", "test"])
    .default("development"),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  enablePublicProxy: z
    .string()
    .default("true")
    .transform((val) => val !== "false"),
  maxUploadSize: z.coerce.number().default(50 * 1024 * 1024), // 50MB
  storageDir: z.string().default(path.resolve(process.cwd(), "storage")),
  logsDir: z.string().default(path.resolve(process.cwd(), "logs")),
  rateLimitWindowMs: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  rateLimitMax: z.coerce.number().default(1000), // per window
  publishRateLimitMax: z.coerce.number().default(50), // stricter limit for uploads
  requestTimeoutMs: z.coerce.number().default(30000), // 30 seconds
});

export type Config = z.infer<typeof configSchema>;

export const config = configSchema.parse({
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL,
  enablePublicProxy: process.env.ENABLE_PUBLIC_PROXY,
  maxUploadSize: process.env.MAX_UPLOAD_SIZE,
  storageDir: process.env.STORAGE_DIR,
  logsDir: process.env.LOGS_DIR,
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: process.env.RATE_LIMIT_MAX,
  publishRateLimitMax: process.env.PUBLISH_RATE_LIMIT_MAX,
  requestTimeoutMs: process.env.REQUEST_TIMEOUT_MS,
});
