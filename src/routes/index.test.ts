import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createServer } from "../server";
import { Storage } from "../storage/fs";

// Mock Storage
vi.mock("../storage/fs", () => ({
  Storage: {
    ensureDirs: vi.fn(),
    getPackageMetadata: vi.fn(),
    savePackageMetadata: vi.fn(),
    saveTarball: vi.fn(),
    getTarball: vi.fn(),
    getTarballStream: vi.fn(),
    getAllPackages: vi.fn(),
    getAllPackagesWithMetadata: vi.fn(),
  },
}));

describe("Server Routes", () => {
  let app: ReturnType<typeof createServer>;

  beforeEach(() => {
    app = createServer();
    vi.clearAllMocks();
  });

  describe("GET /-/ping", () => {
    it("should return pong", async () => {
      const response = await request(app).get("/-/ping");
      expect(response.text).toBe("pong");
      expect(response.status).toBe(200);
    });
  });

  describe("GET /:package (metadata)", () => {
    it("should return 404 for non-existent package", async () => {
      vi.mocked(Storage.getPackageMetadata).mockResolvedValue(null);
      vi.mocked(Storage.getAllPackagesWithMetadata).mockResolvedValue([]);

      const response = await request(app).get("/non-existent");
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Not Found");
    });

    it("should allow valid package names", async () => {
      vi.mocked(Storage.getPackageMetadata).mockResolvedValue(null);
      vi.mocked(Storage.getAllPackagesWithMetadata).mockResolvedValue([]);

      const response = await request(app).get("/my-valid-package");
      expect(response.status).toBe(404); // 404 is expected, not 400
    });
  });

  describe("GET /-/whoami", () => {
    it("should return current user", async () => {
      const response = await request(app).get("/-/whoami");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("username", "modulo-user");
    });
  });

  describe("PUT /-/user/:id (login)", () => {
    it("should return token for valid login", async () => {
      const response = await request(app).put("/-/user/testuser").send({
        name: "testuser",
        password: "secret",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("token");
      expect(response.body.token).toContain("testuser");
    });
  });

  describe("PUT /:package (publish)", () => {
    it("should reject invalid payload", async () => {
      const response = await request(app).put("/test-package").send({
        name: "test-package",
      });

      expect(response.status).toBe(400);
    });
  });
});
