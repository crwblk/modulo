import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { Storage, __setStorageDirs } from "./fs";

const TEST_STORAGE_DIR = path.resolve(__dirname, "../../test-storage");
const TEST_METADATA_DIR = path.join(TEST_STORAGE_DIR, "metadata");
const TEST_TARBALLS_DIR = path.join(TEST_STORAGE_DIR, "tarballs");

describe("Storage", () => {
  beforeEach(async () => {
    // Clean up test directory
    await fs.remove(TEST_STORAGE_DIR);
    await fs.ensureDir(TEST_STORAGE_DIR);

    // Override storage paths
    __setStorageDirs(TEST_STORAGE_DIR);

    await Storage.ensureDirs();
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(TEST_STORAGE_DIR);
  });

  describe("getPackageMetadata", () => {
    it("should return null for non-existent package", async () => {
      const result = await Storage.getPackageMetadata("non-existent");
      expect(result).toBeNull();
    });

    it("should return metadata for existing package", async () => {
      const mockMetadata = {
        name: "test-package",
        "dist-tags": { latest: "1.0.0" },
        versions: {
          "1.0.0": {
            name: "test-package",
            version: "1.0.0",
            dist: {
              shasum: "abc123",
              tarball: "http://example.com/test-1.0.0.tgz",
            },
            _id: "test-package@1.0.0",
          },
        },
        time: {
          created: "2024-01-01T00:00:00.000Z",
          modified: "2024-01-01T00:00:00.000Z",
        },
      };

      await fs.writeJson(
        path.join(TEST_METADATA_DIR, "test-package.json"),
        mockMetadata,
      );

      const result = await Storage.getPackageMetadata("test-package");
      expect(result).toEqual(mockMetadata);
    });
  });

  describe("savePackageMetadata", () => {
    it("should save package metadata to file", async () => {
      const mockMetadata = {
        name: "test-package",
        "dist-tags": { latest: "1.0.0" },
        versions: {
          "1.0.0": {
            name: "test-package",
            version: "1.0.0",
            dist: {
              shasum: "abc123",
              tarball: "http://example.com/test-1.0.0.tgz",
            },
            _id: "test-package@1.0.0",
          },
        },
        time: {
          created: "2024-01-01T00:00:00.000Z",
          modified: "2024-01-01T00:00:00.000Z",
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await Storage.savePackageMetadata("test-package", mockMetadata as any);

      const filePath = path.join(TEST_METADATA_DIR, "test-package.json");
      expect(await fs.pathExists(filePath)).toBe(true);

      const saved = await fs.readJson(filePath);
      expect(saved).toEqual(mockMetadata);
    });
  });

  describe("saveTarball", () => {
    it("should save tarball data to file", async () => {
      const testData = Buffer.from("test tarball content");
      await Storage.saveTarball("test-package", "test-1.0.0.tgz", testData);

      const filePath = path.join(
        TEST_TARBALLS_DIR,
        "test-package",
        "test-1.0.0.tgz",
      );
      expect(await fs.pathExists(filePath)).toBe(true);

      const saved = await fs.readFile(filePath);
      expect(saved).toEqual(testData);
    });
  });

  describe("getTarball", () => {
    it("should return null for non-existent tarball", async () => {
      const result = await Storage.getTarball("non-existent", "test.tgz");
      expect(result).toBeNull();
    });

    it("should return tarball data for existing tarball", async () => {
      const testData = Buffer.from("test tarball content");
      const pkgDir = path.join(TEST_TARBALLS_DIR, "test-package");
      await fs.ensureDir(pkgDir);
      await fs.writeFile(path.join(pkgDir, "test-1.0.0.tgz"), testData);

      const result = await Storage.getTarball("test-package", "test-1.0.0.tgz");
      expect(result).toEqual(testData);
    });
  });

  describe("getAllPackages", () => {
    it("should return empty array when no packages exist", async () => {
      const result = await Storage.getAllPackages();
      expect(result).toEqual([]);
    });

    it("should return list of package names", async () => {
      await fs.writeJson(path.join(TEST_METADATA_DIR, "pkg1.json"), {
        name: "pkg1",
      });
      await fs.writeJson(path.join(TEST_METADATA_DIR, "pkg2.json"), {
        name: "pkg2",
      });
      await fs.writeJson(path.join(TEST_METADATA_DIR, "pkg3.json"), {
        name: "pkg3",
      });

      const result = await Storage.getAllPackages();
      expect(result).toContain("pkg1");
      expect(result).toContain("pkg2");
      expect(result).toContain("pkg3");
      expect(result).toHaveLength(3);
    });

    it("should ignore non-json files", async () => {
      await fs.writeJson(path.join(TEST_METADATA_DIR, "pkg1.json"), {
        name: "pkg1",
      });
      await fs.writeFile(
        path.join(TEST_METADATA_DIR, "readme.txt"),
        "not a package",
      );

      const result = await Storage.getAllPackages();
      expect(result).toEqual(["pkg1"]);
    });
  });
});
