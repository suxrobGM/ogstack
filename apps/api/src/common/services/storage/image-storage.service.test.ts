import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { CacheService } from "@/common/services/cache";
import { ImageStorageService } from "./image-storage.service";

function createMockCacheService() {
  return {
    get: mock(() => Promise.resolve(null)),
    set: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    clear: mock(() => Promise.resolve()),
  } as unknown as CacheService;
}

describe("ImageStorageService", () => {
  let service: ImageStorageService;
  let mockCache: ReturnType<typeof createMockCacheService>;

  beforeEach(() => {
    container.clearInstances();
    mockCache = createMockCacheService();
    container.registerInstance(CacheService, mockCache as unknown as CacheService);
    service = container.resolve(ImageStorageService);
  });

  describe("store", () => {
    it("should store image and cache the buffer", async () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const result = await service.store("test-key", buffer);

      expect(result.key).toBe("test-key");
      expect(result.url).toContain("test-key");
      expect(result.size).toBe(4);
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("should return from cache if available", async () => {
      const buffer = Buffer.from([0x89, 0x50]);
      (mockCache.get as ReturnType<typeof mock>).mockResolvedValue(buffer);

      const result = await service.get("test-key");

      expect(result).toEqual(buffer);
    });

    it("should fall back to backend if not in cache", async () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      await service.store("test-key", buffer);
      (mockCache.get as ReturnType<typeof mock>).mockResolvedValue(null);

      const result = await service.get("test-key");

      expect(result).toBeInstanceOf(Buffer);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should return null for non-existent key", async () => {
      const result = await service.get("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete from backend and cache", async () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      await service.store("test-key", buffer);

      await service.delete("test-key");

      expect(mockCache.delete).toHaveBeenCalledWith("img:test-key");
    });
  });

  describe("exists", () => {
    it("should return true if in cache", async () => {
      (mockCache.get as ReturnType<typeof mock>).mockResolvedValue(Buffer.from([1]));

      const result = await service.exists("test-key");
      expect(result).toBe(true);
    });

    it("should check backend if not in cache", async () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      await service.store("test-key", buffer);
      (mockCache.get as ReturnType<typeof mock>).mockResolvedValue(null);

      const result = await service.exists("test-key");
      expect(result).toBe(true);
    });

    it("should return false for non-existent key", async () => {
      const result = await service.exists("nonexistent");
      expect(result).toBe(false);
    });
  });
});
