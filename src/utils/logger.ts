import winston from "winston";
import path from "path";

const logDir = path.resolve(process.cwd(), "logs");

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "modulo-registry" },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Write error logs to error.log
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, also log to the console with a simpler format
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        }),
      ),
    }),
  );
}
