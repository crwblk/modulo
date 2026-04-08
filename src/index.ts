import { createServer } from "./server";
import { Storage } from "./storage/fs";
import { logger } from "./utils/logger";
import { config } from "./config";

async function main() {
  await Storage.ensureDirs();

  const app = createServer();

  app.listen(config.port, () => {
    logger.info(
      `Modulo Private npm Registry is running on http://localhost:${config.port}`,
    );
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Public Proxy: ${config.enablePublicProxy ? "enabled" : "disabled"}`);
  });
}

main().catch((err) => {
  logger.error("Fatal error during startup:", err);
  process.exit(1);
});
