import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { ImageStorageService } from "@/common/services/storage";
import { ImageKind, PrismaClient } from "@/generated/prisma";
import { ImageService } from "./image.service";

function createMockImage(overrides: Record<string, unknown> = {}) {
  return {
    id: "img-1",
    userId: "user-1",
    projectId: "proj-1",
    apiKeyId: null,
    templateId: null,
    category: "TECH" as const,
    sourceUrl: "https://example.com",
    cacheKey: "cache-abc",
    kind: ImageKind.OG,
    imageUrl: "http://localhost/uploads/cache-abc.png",
    cdnUrl: null,
    title: "Example",
    description: "A sample page",
    faviconUrl: null,
    width: 1200,
    height: 630,
    format: "PNG" as const,
    fileSize: 1024,
    aiModel: null,
    aiPrompt: null,
    aiEnabled: false,
    generatedOnPlan: "FREE",
    generationMs: 420,
    serveCount: 1,
    assets: null,
    createdAt: new Date("2026-04-01"),
    expiresAt: null,
    template: null,
    project: { name: "My Project", publicId: "proj-public-1" },
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    image: {
      findMany: mock(() => Promise.resolve([createMockImage()])),
      findUnique: mock(() => Promise.resolve(createMockImage())),
      count: mock(() => Promise.resolve(1)),
      update: mock(() =>
        Promise.resolve(createMockImage({ title: "Updated", description: "Edited" })),
      ),
      delete: mock(() => Promise.resolve(createMockImage())),
    },
  } as unknown as PrismaClient;
}

function createMockStorage() {
  return {
    delete: mock(() => Promise.resolve()),
    get: mock(() => Promise.resolve(Buffer.from("fake-png-bytes"))),
  } as unknown as ImageStorageService;
}

describe("ImageService", () => {
  let service: ImageService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    mockStorage = createMockStorage();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    container.registerInstance(ImageStorageService, mockStorage as unknown as ImageStorageService);
    service = container.resolve(ImageService);
  });

  describe("findById", () => {
    it("returns the image when owner requests it", async () => {
      const result = await service.findById("user-1", "img-1");
      expect(result.id).toBe("img-1");
      expect(result.projectName).toBe("My Project");
    });

    it("throws NotFoundError when image doesn't exist", () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      expect(service.findById("user-1", "missing")).rejects.toThrow("Image not found");
    });

    it("throws ForbiddenError for another user's image", () => {
      expect(service.findById("other", "img-1")).rejects.toThrow("Not allowed");
    });
  });

  describe("list", () => {
    it("returns paginated user-scoped items", async () => {
      const result = await service.list("user-1", { page: 1, limit: 20 });
      expect(result.items).toHaveLength(1);
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it("applies projectId filter", async () => {
      await service.list("user-1", { page: 1, limit: 20, projectId: "proj-9" });
      const call = (mockPrisma.image.findMany as ReturnType<typeof mock>).mock.calls[0];
      const args = (call as unknown[])[0] as { where: Record<string, unknown> };
      expect(args.where.projectId).toBe("proj-9");
    });

    it("applies category filter", async () => {
      await service.list("user-1", { page: 1, limit: 20, category: "TECH" });
      const call = (mockPrisma.image.findMany as ReturnType<typeof mock>).mock.calls[0];
      const args = (call as unknown[])[0] as { where: { category?: string } };
      expect(args.where.category).toBe("TECH");
    });

    it("applies kind filter", async () => {
      await service.list("user-1", { page: 1, limit: 20, kind: "icon_set" });
      const call = (mockPrisma.image.findMany as ReturnType<typeof mock>).mock.calls[0];
      const args = (call as unknown[])[0] as { where: { kind?: string } };
      expect(args.where.kind).toBe(ImageKind.ICON_SET);
    });

    it("applies date range filter", async () => {
      await service.list("user-1", {
        page: 1,
        limit: 20,
        from: new Date("2026-01-01T00:00:00.000Z"),
        to: new Date("2026-02-01T00:00:00.000Z"),
      });
      const call = (mockPrisma.image.findMany as ReturnType<typeof mock>).mock.calls[0];
      const args = (call as unknown[])[0] as { where: { createdAt?: Record<string, Date> } };
      expect(args.where.createdAt?.gte).toBeInstanceOf(Date);
      expect(args.where.createdAt?.lte).toBeInstanceOf(Date);
    });

    it("applies search across sourceUrl and title", async () => {
      await service.list("user-1", { page: 1, limit: 20, search: "foo" });
      const call = (mockPrisma.image.findMany as ReturnType<typeof mock>).mock.calls[0];
      const args = (call as unknown[])[0] as { where: { OR?: unknown[] } };
      expect(args.where.OR).toHaveLength(2);
    });

    it("returns empty list when user has no images", async () => {
      (mockPrisma.image.findMany as ReturnType<typeof mock>).mockResolvedValue([]);
      (mockPrisma.image.count as ReturnType<typeof mock>).mockResolvedValue(0);
      const result = await service.list("user-1", { page: 1, limit: 20 });
      expect(result.items).toHaveLength(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it("computes totalPages", async () => {
      (mockPrisma.image.count as ReturnType<typeof mock>).mockResolvedValue(45);
      const result = await service.list("user-1", { page: 1, limit: 20 });
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe("update", () => {
    it("updates owner's image", async () => {
      const res = await service.update("user-1", "img-1", {
        title: "Updated",
        description: "Edited",
      });
      expect(res.title).toBe("Updated");
      expect(mockPrisma.image.update).toHaveBeenCalled();
    });

    it("throws NotFound for missing image", async () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      expect(service.update("user-1", "x", { title: "a" })).rejects.toThrow("Image not found");
    });

    it("throws Forbidden for other user's image", async () => {
      expect(service.update("other", "img-1", { title: "a" })).rejects.toThrow("Not allowed");
    });
  });

  describe("delete", () => {
    it("deletes OG image storage with .png suffix", async () => {
      await service.delete("user-1", "img-1");
      expect(mockStorage.delete).toHaveBeenCalledWith("cache-abc.png");
      expect(mockPrisma.image.delete).toHaveBeenCalled();
    });

    it("deletes ICON_SET storage under its prefix", async () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockImage({ kind: ImageKind.ICON_SET }),
      );
      await service.delete("user-1", "img-1");
      expect(mockStorage.delete).toHaveBeenCalledWith("cache-abc/");
      expect(mockPrisma.image.delete).toHaveBeenCalled();
    });

    it("swallows storage.delete errors but still removes DB row", async () => {
      (mockStorage.delete as ReturnType<typeof mock>).mockRejectedValue(new Error("boom"));
      await service.delete("user-1", "img-1");
      expect(mockPrisma.image.delete).toHaveBeenCalled();
    });

    it("throws NotFound for missing image", async () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      expect(service.delete("user-1", "x")).rejects.toThrow("Image not found");
    });

    it("throws Forbidden for other user's image", async () => {
      expect(service.delete("other", "img-1")).rejects.toThrow("Not allowed");
    });
  });

  describe("bulkDelete", () => {
    it("deletes every image owned by the user", async () => {
      (mockPrisma.image.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { id: "i1", cacheKey: "k1", kind: ImageKind.OG },
        { id: "i2", cacheKey: "k2", kind: ImageKind.ICON_SET },
      ]);

      const result = await service.bulkDelete("user-1", ["i1", "i2"]);
      expect(result.deleted).toBe(2);
      expect(mockStorage.delete).toHaveBeenCalledTimes(2);
      expect(mockPrisma.image.delete).toHaveBeenCalledTimes(2);
    });

    it("returns 0 when no images match the ids", async () => {
      (mockPrisma.image.findMany as ReturnType<typeof mock>).mockResolvedValue([]);
      const result = await service.bulkDelete("user-1", ["nope"]);
      expect(result.deleted).toBe(0);
      expect(mockPrisma.image.delete).not.toHaveBeenCalled();
    });
  });

  describe("deleteAsAdmin", () => {
    it("deletes regardless of ownership when admin calls", async () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "img-1",
        cacheKey: "cache-abc",
        kind: ImageKind.OG,
      });

      const result = await service.deleteAsAdmin("img-1");
      expect(result.success).toBe(true);
      expect(mockPrisma.image.delete).toHaveBeenCalled();
    });

    it("throws NotFoundError when image doesn't exist", () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      expect(service.deleteAsAdmin("missing")).rejects.toThrow("Image not found");
    });
  });

  describe("deleteStaleForProject", () => {
    it("deletes each stale image and returns count", async () => {
      (mockPrisma.image.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { id: "i1", cacheKey: "k1", kind: ImageKind.OG },
        { id: "i2", cacheKey: "k2", kind: ImageKind.OG },
      ]);

      const deleted = await service.deleteStaleForProject("proj-1", new Date("2026-03-01"));
      expect(deleted).toBe(2);
    });

    it("returns 0 and continues when a row delete fails", async () => {
      (mockPrisma.image.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { id: "i1", cacheKey: "k1", kind: ImageKind.OG },
        { id: "i2", cacheKey: "k2", kind: ImageKind.OG },
      ]);
      (mockPrisma.image.delete as ReturnType<typeof mock>).mockImplementationOnce(() =>
        Promise.reject(new Error("db error")),
      );

      const deleted = await service.deleteStaleForProject("proj-1", new Date("2026-03-01"));
      expect(deleted).toBe(1);
    });

    it("returns 0 when no stale rows match", async () => {
      (mockPrisma.image.findMany as ReturnType<typeof mock>).mockResolvedValue([]);
      const deleted = await service.deleteStaleForProject("proj-1", new Date("2026-03-01"));
      expect(deleted).toBe(0);
    });
  });

  describe("buildDownloadBundle", () => {
    it("returns a single PNG for an OG image", async () => {
      const bundle = await service.buildDownloadBundle("user-1", "img-1");
      expect(bundle.filename).toBe("cache-abc.png");
      expect(bundle.buffer).toBeInstanceOf(Buffer);
    });

    it("throws NotFoundError when the stored file is missing", () => {
      (mockStorage.get as ReturnType<typeof mock>).mockResolvedValue(null);
      expect(service.buildDownloadBundle("user-1", "img-1")).rejects.toThrow(
        "Image file is missing from storage.",
      );
    });

    it("zips every asset for an icon set", async () => {
      const iconImage = createMockImage({
        kind: ImageKind.ICON_SET,
        assets: [
          { name: "favicon-32.png", url: "u", width: 32, height: 32, sizeBytes: 1 },
          { name: "favicon-180.png", url: "u", width: 180, height: 180, sizeBytes: 1 },
        ],
      });
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue(iconImage);

      const bundle = await service.buildDownloadBundle("user-1", "img-1");
      expect(bundle.filename).toBe("favicons.zip");
      expect(bundle.buffer.byteLength).toBeGreaterThan(0);
    });

    it("throws BadRequestError when icon set has no assets", () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockImage({ kind: ImageKind.ICON_SET, assets: null }),
      );
      expect(service.buildDownloadBundle("user-1", "img-1")).rejects.toThrow(
        "This icon set has no assets to bundle.",
      );
    });

    it("continues past missing icon set assets", async () => {
      const iconImage = createMockImage({
        kind: ImageKind.ICON_SET,
        assets: [
          { name: "favicon-32.png", url: "u", width: 32, height: 32, sizeBytes: 1 },
          { name: "favicon-180.png", url: "u", width: 180, height: 180, sizeBytes: 1 },
        ],
      });
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue(iconImage);
      (mockStorage.get as ReturnType<typeof mock>)
        .mockResolvedValueOnce(null)
        .mockResolvedValue(Buffer.from("png"));

      const bundle = await service.buildDownloadBundle("user-1", "img-1");
      expect(bundle.buffer.byteLength).toBeGreaterThan(0);
    });
  });
});
