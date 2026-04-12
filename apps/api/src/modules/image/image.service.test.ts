import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { ImageStorageService } from "@/common/services/storage";
import { PrismaClient } from "@/generated/prisma";
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
    generationMs: 420,
    serveCount: 1,
    createdAt: new Date("2026-04-01"),
    expiresAt: null,
    template: null,
    project: { name: "My Project" },
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

    it("applies date range filter", async () => {
      await service.list("user-1", {
        page: 1,
        limit: 20,
        from: "2026-01-01T00:00:00.000Z",
        to: "2026-02-01T00:00:00.000Z",
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
    it("deletes owner's image and removes storage when no other refs", async () => {
      (mockPrisma.image.count as ReturnType<typeof mock>).mockResolvedValue(0);
      await service.delete("user-1", "img-1");
      expect(mockStorage.delete).toHaveBeenCalledWith("cache-abc");
      expect(mockPrisma.image.delete).toHaveBeenCalled();
    });

    it("skips storage.delete when another row references the cacheKey", async () => {
      (mockPrisma.image.count as ReturnType<typeof mock>).mockResolvedValue(1);
      await service.delete("user-1", "img-1");
      expect(mockStorage.delete).not.toHaveBeenCalled();
      expect(mockPrisma.image.delete).toHaveBeenCalled();
    });

    it("swallows storage.delete errors but still removes DB row", async () => {
      (mockPrisma.image.count as ReturnType<typeof mock>).mockResolvedValue(0);
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
});
