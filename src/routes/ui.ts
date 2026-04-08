import { Router } from "express";
import { Storage } from "../storage/fs";
import type { PackageSummary } from "../types";
import { getParam } from "../utils/params";

export const uiRouter = Router();

uiRouter.get("/packages", async (req, res, next) => {
  try {
    // Support pagination query parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(req.query.limit as string) || 50),
      200,
    );

    const { packages: packagesMetadata, total } =
      await Storage.getPaginatedPackagesWithMetadata(page, limit);

    const result: PackageSummary[] = packagesMetadata.map((metadata) => {
      const versions = Object.keys(metadata.versions || {});
      const latest =
        metadata["dist-tags"]?.latest || versions.at(-1) || "0.0.0";
      return {
        name: metadata.name,
        description: metadata.description || "No description available",
        version: latest,
        lastUpdated: metadata.time?.modified || new Date().toISOString(),
      };
    });

    return res.status(200).json({
      packages: result,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

uiRouter.get("/package/:name", async (req, res, next) => {
  try {
    const pkgName = getParam(req.params, "name");
    const metadata = await Storage.getPackageMetadata(pkgName);
    if (metadata) {
      return res.status(200).json(metadata);
    }
    return res.status(404).json({
      error: "Package not found locally",
      code: "NOT_FOUND",
    });
  } catch (error) {
    next(error);
  }
});

// Search endpoint with server-side filtering and pagination
uiRouter.get("/search", async (req, res, next) => {
  try {
    const query = (req.query.q as string)?.toLowerCase() || "";
    const size = Math.min(parseInt(req.query.size as string) || 20, 100);
    const from = parseInt(req.query.from as string) || 0;

    // Use paginated fetch to avoid loading all packages into memory
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(req.query.limit as string) || 100),
      500,
    );

    const { packages: packagesMetadata } =
      await Storage.getPaginatedPackagesWithMetadata(page, limit);

    let filtered = packagesMetadata;
    if (query) {
      filtered = packagesMetadata.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(query) ||
          (pkg.description?.toLowerCase().includes(query) ?? false) ||
          pkg.keywords?.some((kw) => kw.toLowerCase().includes(query)),
      );
    }

    const paginated = filtered.slice(from, from + size);
    const result: PackageSummary[] = paginated.map((metadata) => {
      const versions = Object.keys(metadata.versions || {});
      const latest =
        metadata["dist-tags"]?.latest || versions.at(-1) || "0.0.0";
      return {
        name: metadata.name,
        description: metadata.description || "No description available",
        version: latest,
        lastUpdated: metadata.time?.modified || new Date().toISOString(),
      };
    });

    return res.status(200).json({
      objects: result,
      total: filtered.length,
      from,
      size,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
});
