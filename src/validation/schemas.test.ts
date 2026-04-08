import { describe, it, expect } from "vitest";
import {
  packageNameSchema,
  semverSchema,
  publishPayloadSchema,
  authPayloadSchema,
} from "./schemas";

describe("Validation Schemas", () => {
  describe("packageNameSchema", () => {
    it("should accept valid package names", () => {
      expect(() => packageNameSchema.parse("my-package")).not.toThrow();
      expect(() => packageNameSchema.parse("scoped_pkg")).not.toThrow();
      expect(() => packageNameSchema.parse("test123")).not.toThrow();
    });

    it("should reject invalid package names", () => {
      expect(() => packageNameSchema.parse("_invalid")).toThrow();
      expect(() => packageNameSchema.parse(".hidden")).toThrow();
      expect(() => packageNameSchema.parse("-start")).toThrow();
      expect(() => packageNameSchema.parse("UPPERCASE")).toThrow();
      expect(() => packageNameSchema.parse("")).toThrow();
    });
  });

  describe("semverSchema", () => {
    it("should accept valid semver versions", () => {
      expect(() => semverSchema.parse("1.0.0")).not.toThrow();
      expect(() => semverSchema.parse("0.1.0-alpha")).not.toThrow();
      expect(() => semverSchema.parse("1.0.0-beta.1+build.123")).not.toThrow();
    });

    it("should reject invalid versions", () => {
      expect(() => semverSchema.parse("1.0")).toThrow();
      expect(() => semverSchema.parse("1")).toThrow();
      expect(() => semverSchema.parse("invalid")).toThrow();
    });
  });

  describe("publishPayloadSchema", () => {
    it("should accept valid publish payload", () => {
      const validPayload = {
        name: "test-package",
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
      };

      expect(() => publishPayloadSchema.parse(validPayload)).not.toThrow();
    });

    it("should reject payload without versions", () => {
      const invalidPayload = {
        name: "test-package",
      };

      expect(() => publishPayloadSchema.parse(invalidPayload)).toThrow();
    });
  });

  describe("authPayloadSchema", () => {
    it("should accept valid auth payload", () => {
      const validPayload = {
        name: "testuser",
        password: "secret",
      };

      expect(() => authPayloadSchema.parse(validPayload)).not.toThrow();
    });

    it("should reject empty credentials", () => {
      expect(() =>
        authPayloadSchema.parse({ name: "", password: "" }),
      ).toThrow();
    });
  });
});
