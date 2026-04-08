import fs from "fs-extra";
import path from "path";
import type { ReadStream } from "fs";
import { createReadStream } from "fs";
import type { PackageMetadata } from "../types";
import { logger } from "../utils/logger";
import { isValidPackageName, isValidFilename } from "../middleware/security";

let STORAGE_DIR = path.resolve(process.cwd(), "storage");
let METADATA_DIR = path.join(STORAGE_DIR, "metadata");
let TARBALLS_DIR = path.join(STORAGE_DIR, "tarballs");

// Allow overriding for testing
export function __setStorageDirs(baseDir: string) {
  STORAGE_DIR = baseDir;
  METADATA_DIR = path.join(baseDir, "metadata");
  TARBALLS_DIR = path.join(baseDir, "tarballs");
}

/**
 * Normalize a path and verify it stays within the expected root directory.
 * Throws if the resolved path escapes the root.
 */
function safeResolve(rootDir: string, ...segments: string[]): string {
  const resolved = path.resolve(rootDir, ...segments);
  const normalizedRoot = path.resolve(rootDir);
  if (!resolved.startsWith(normalizedRoot)) {
    throw new Error("Path traversal detected: constructed path escapes root directory");
  }
  return resolved;
}

export const Storage = {
  async ensureDirs() {
    await fs.ensureDir(METADATA_DIR);
    await fs.ensureDir(TARBALLS_DIR);
    await fs.ensureDir(path.resolve(process.cwd(), "logs"));
  },

  async getPackageMetadata(name: string): Promise<PackageMetadata | null> {
    if (!isValidPackageName(name)) {
      throw new Error("Invalid package name format");
    }
    const filePath = safeResolve(METADATA_DIR, `${name}.json`);
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath);
    }
    return null;
  },

  /**
   * Atomically save package metadata using temporary file + rename
   * This prevents corruption from concurrent writes
   */
  async savePackageMetadata(name: string, metadata: PackageMetadata) {
    if (!isValidPackageName(name)) {
      throw new Error("Invalid package name format");
    }
    const filePath = safeResolve(METADATA_DIR, `${name}.json`);
    const tempFile = `${filePath}.tmp.${Date.now()}.${process.pid}`;
    try {
      await fs.writeJson(tempFile, metadata, { spaces: 2 });
      await fs.rename(tempFile, filePath);
    } catch (error) {
      // Clean up temp file if rename failed
      await fs.remove(tempFile).catch(() => {});
      throw error;
    }
  },

  /**
   * Delete package metadata file
   */
  async deletePackageMetadata(name: string) {
    if (!isValidPackageName(name)) {
      throw new Error("Invalid package name format");
    }
    const filePath = safeResolve(METADATA_DIR, `${name}.json`);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  },

  async saveTarball(name: string, filename: string, data: Buffer) {
    if (!isValidPackageName(name)) {
      throw new Error("Invalid package name format");
    }
    if (!isValidFilename(filename)) {
      throw new Error("Invalid filename format");
    }
    const pkgDir = safeResolve(TARBALLS_DIR, name);
    await fs.ensureDir(pkgDir);
    const filePath = safeResolve(pkgDir, filename);
    await fs.writeFile(filePath, data);
  },

  async getTarball(name: string, filename: string): Promise<Buffer | null> {
    if (!isValidPackageName(name)) {
      throw new Error("Invalid package name format");
    }
    if (!isValidFilename(filename)) {
      throw new Error("Invalid filename format");
    }
    const filePath = safeResolve(TARBALLS_DIR, name, filename);
    if (await fs.pathExists(filePath)) {
      return await fs.readFile(filePath);
    }
    return null;
  },

  getTarballStream(name: string, filename: string): ReadStream | null {
    if (!isValidPackageName(name)) {
      throw new Error("Invalid package name format");
    }
    if (!isValidFilename(filename)) {
      throw new Error("Invalid filename format");
    }
    const filePath = safeResolve(TARBALLS_DIR, name, filename);
    if (!fs.pathExistsSync(filePath)) {
      return null;
    }
    return createReadStream(filePath);
  },

  /**
   * Delete a tarball file
   */
  async deleteTarball(name: string, filename: string) {
    if (!isValidPackageName(name)) {
      throw new Error("Invalid package name format");
    }
    if (!isValidFilename(filename)) {
      throw new Error("Invalid filename format");
    }
    const filePath = safeResolve(TARBALLS_DIR, name, filename);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  },

  /**
   * Delete entire package tarball directory
   */
  async deleteTarballDir(name: string) {
    if (!isValidPackageName(name)) {
      throw new Error("Invalid package name format");
    }
    const pkgDir = safeResolve(TARBALLS_DIR, name);
    if (await fs.pathExists(pkgDir)) {
      await fs.remove(pkgDir);
    }
  },

  async getAllPackages(): Promise<string[]> {
    try {
      const files = await fs.readdir(METADATA_DIR);
      return files
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(".json", ""));
    } catch (error) {
      logger.error("Failed to read metadata directory", { error });
      return [];
    }
  },

  async getAllPackagesWithMetadata(): Promise<PackageMetadata[]> {
    const packages = await this.getAllPackages();
    // Read all metadata files in parallel
    const results = await Promise.all(
      packages.map(async (name) => {
        const metadata = await this.getPackageMetadata(name);
        return metadata;
      }),
    );
    return results.filter((m): m is PackageMetadata => m !== null);
  },

  /**
   * Get paginated packages with metadata
   * @param page Page number (1-based)
   * @param limit Number of packages per page
   */
  async getPaginatedPackagesWithMetadata(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ packages: PackageMetadata[]; total: number }> {
    const packages = await this.getAllPackages();
    const total = packages.length;

    // Calculate pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPackageNames = packages.slice(start, end);

    // Read metadata only for paginated packages
    const results = await Promise.all(
      paginatedPackageNames.map(async (name) => {
        const metadata = await this.getPackageMetadata(name);
        return metadata;
      }),
    );

    return {
      packages: results.filter(
        (m): m is PackageMetadata => m !== null,
      ),
      total,
    };
  },
};
