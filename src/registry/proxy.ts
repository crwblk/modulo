import { config } from "../config";
import { logger } from "../utils/logger";
import { isValidPackageName } from "../middleware/security";

const NPM_REGISTRY = "https://registry.npmjs.org";

export const Proxy = {
  async fetchMetadata(packageName: string) {
    if (!config.enablePublicProxy) {
      logger.debug("Public proxy is disabled", { packageName });
      return null;
    }

    // Validate package name to prevent SSRF attacks
    if (!isValidPackageName(packageName)) {
      throw new Error("Invalid package name format");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs);

    try {
      const response = await fetch(`${NPM_REGISTRY}/${packageName}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Not found in public registry either
        }
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      return await response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          logger.error("Proxy fetch timed out", {
            packageName,
            timeoutMs: config.requestTimeoutMs,
          });
          throw new Error("Proxy registry request timed out");
        }
        logger.error("Proxy fetch error", {
          packageName,
          error: error.message,
        });
        // Check for network errors
        if (error.message.includes("fetch failed")) {
          throw new Error("Proxy registry unavailable");
        }
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
