import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { logger } from "../utils/logger";
import { config } from "../config";

export const authRouter = Router();

// npm login
// NOTE: This is an open registry - any username/password combination works
// For production use, implement proper authentication
authRouter.put("/-/user/:id", async (req, res, next) => {
  try {
    const idValue = req.params.id;
    const username = idValue.includes(":") ? idValue.split(":").pop() : idValue;

    if (!username) {
      return res.status(400).json({
        error: "Invalid username",
        code: "INVALID_USERNAME",
      });
    }

    logger.info(`User logged in: ${username}`, { requestId: req.id });

    // Return a generic token
    return res.status(201).json({
      ok: true,
      token: `modulo-token-${username}-${Date.now()}`,
    });
  } catch (error) {
    next(error);
  }
});

// npm whoami
authRouter.get("/-/whoami", (_req, res) => {
  return res.status(200).json({ username: "modulo-user" });
});

/**
 * Middleware for checking token (currently passthrough for open registry)
 *
 * IMPORTANT: This middleware is intentionally open for development use.
 * For production deployment, implement proper token validation:
 *
 * 1. Store tokens in database/file
 * 2. Validate Authorization header
 * 3. Extract and verify token
 * 4. Reject invalid requests with 401
 *
 * To enable auth, set REQUIRE_AUTH=true in .env (not yet implemented)
 */
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Open registry mode - passthrough
  // TODO: Implement proper token validation when REQUIRE_AUTH config is added
  if (config.nodeEnv === "production") {
    logger.warn(
      "Auth middleware in passthrough mode in production - consider implementing proper authentication",
    );
  }
  next();
};
