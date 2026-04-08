import { config } from "../config";
import { logger } from "../utils/logger";

const NPM_REGISTRY = "https://registry.npmjs.org";

export const Proxy = {
  async fetchMetadata(packageName: string) {
    if (!config.enablePublicProxy) {
      logger.debug("Public proxy is disabled", { packageName });
      return null;
    }

    try {
      const response = await fetch(`${NPM_REGISTRY}/${packageName}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Not found in public registry either
        }
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      return await response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
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
    }
  },
};
