import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { ScraperService, type UrlMetadata } from "@/common/services/scraper.service";
import { ImageStorageService } from "@/common/services/storage";
import { PrismaClient } from "@/generated/prisma";
import { TemplateService } from "@/modules/template/template.service";
import { UsageService } from "@/modules/usage/usage.service";
import { GenerationService } from "./generation.service";

const MOCK_METADATA: UrlMetadata = {
  url: "https://example.com",
  title: "Example Page",
  description: "A sample page",
  ogTitle: "OG Title",
  ogDescription: "OG Description",
  ogImage: "https://example.com/image.png",
  favicon: "https://example.com/favicon.ico",
  author: "John Doe",
  siteName: "Example Site",
};

const MOCK_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

function createMockPrisma() {
  return {
    project: {
      findUnique: mock(() =>
        Promise.resolve({
          id: "proj-1",
          userId: "user-1",
          publicId: "abc123",
          domains: [],
          user: { id: "user-1" },
        }),
      ),
    },
    generatedImage: {
      findUnique: mock(() => Promise.resolve(null)),
      create: mock(() =>
        Promise.resolve({
          id: "img-1",
          imageUrl: "/uploads/images/abc.png",
          title: "OG Title",
          description: "OG Description",
          faviconUrl: "https://example.com/favicon.ico",
        }),
      ),
      update: mock(() => Promise.resolve({})),
      delete: mock(() => Promise.resolve({})),
    },
    template: {
      findUnique: mock(() => Promise.resolve({ id: "tmpl-1" })),
    },
  } as unknown as PrismaClient;
}

function createMockScraper() {
  return {
    extractMetadata: mock(() => Promise.resolve(MOCK_METADATA)),
  } as unknown as ScraperService;
}

function createMockTemplateService() {
  return {
    render: mock(() => Promise.resolve(MOCK_PNG)),
  } as unknown as TemplateService;
}

function createMockUsageService() {
  return {
    enforceQuota: mock(() => Promise.resolve()),
    recordUsage: mock(() => Promise.resolve()),
  } as unknown as UsageService;
}

function createMockStorageService() {
  return {
    store: mock(() => Promise.resolve({ key: "abc", url: "/uploads/images/abc.png", size: 4 })),
    get: mock(() => Promise.resolve(MOCK_PNG)),
    delete: mock(() => Promise.resolve()),
    exists: mock(() => Promise.resolve(true)),
  } as unknown as ImageStorageService;
}

describe("GenerationService", () => {
  let service: GenerationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockScraper: ReturnType<typeof createMockScraper>;
  let mockTemplateService: ReturnType<typeof createMockTemplateService>;
  let mockUsageService: ReturnType<typeof createMockUsageService>;
  let mockStorage: ReturnType<typeof createMockStorageService>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    mockScraper = createMockScraper();
    mockTemplateService = createMockTemplateService();
    mockUsageService = createMockUsageService();
    mockStorage = createMockStorageService();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    container.registerInstance(ScraperService, mockScraper as unknown as ScraperService);
    container.registerInstance(TemplateService, mockTemplateService as unknown as TemplateService);
    container.registerInstance(UsageService, mockUsageService as unknown as UsageService);
    container.registerInstance(ImageStorageService, mockStorage as unknown as ImageStorageService);
    service = container.resolve(GenerationService);
  });

  describe("generate", () => {
    const baseParams = {
      userId: "user-1",
      projectId: "proj-1",
      url: "https://example.com",
      template: "gradient_dark" as const,
    };

    it("should generate a new image on cache miss", async () => {
      const result = await service.generate(baseParams);

      expect(result.cached).toBe(false);
      expect(result.imageUrl).toBeDefined();
      expect(result.metadata.title).toBe("OG Title");
      expect(mockScraper.extractMetadata).toHaveBeenCalledWith("https://example.com");
      expect(mockTemplateService.render).toHaveBeenCalled();
      expect(mockStorage.store).toHaveBeenCalled();
      expect(mockPrisma.generatedImage.create).toHaveBeenCalled();
      expect(mockUsageService.recordUsage).toHaveBeenCalled();
    });

    it("should return cached image on cache hit", async () => {
      const cachedImage = {
        id: "img-cached",
        imageUrl: "/uploads/images/cached.png",
        cdnUrl: "https://cdn.example.com/cached.png",
        title: "Cached Title",
        description: "Cached Desc",
        faviconUrl: "https://example.com/fav.ico",
        serveCount: 5,
      };
      (mockPrisma.generatedImage.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        cachedImage,
      );

      const result = await service.generate(baseParams);

      expect(result.cached).toBe(true);
      expect(result.imageUrl).toBe("https://cdn.example.com/cached.png");
      expect(result.metadata.title).toBe("Cached Title");
      expect(mockScraper.extractMetadata).not.toHaveBeenCalled();
      expect(mockTemplateService.render).not.toHaveBeenCalled();
      expect(mockStorage.store).not.toHaveBeenCalled();
      expect(mockPrisma.generatedImage.update).toHaveBeenCalled();
    });

    it("should throw NotFoundError if project not found", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      await expect(service.generate(baseParams)).rejects.toThrow("Project not found");
    });

    it("should throw NotFoundError if user does not own project", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "proj-1",
        userId: "other-user",
      });

      await expect(service.generate(baseParams)).rejects.toThrow("Project not found");
    });

    it("should call enforceQuota before generating", async () => {
      await service.generate(baseParams);

      expect(mockUsageService.enforceQuota).toHaveBeenCalledWith("user-1", "proj-1", undefined);
    });

    it("should propagate ForbiddenError from quota enforcement", async () => {
      (mockUsageService.enforceQuota as ReturnType<typeof mock>).mockRejectedValue(
        new Error("Monthly quota of 50 images exceeded"),
      );

      await expect(service.generate(baseParams)).rejects.toThrow("quota");
    });

    it("should record usage for cache misses", async () => {
      await service.generate(baseParams);

      expect(mockUsageService.recordUsage).toHaveBeenCalledWith(
        "user-1",
        "proj-1",
        false,
        undefined,
      );
    });

    it("should record cache hits in usage", async () => {
      (mockPrisma.generatedImage.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "img-cached",
        imageUrl: "/uploads/images/cached.png",
        cdnUrl: null,
        title: "T",
        description: "D",
        faviconUrl: null,
        serveCount: 1,
      });

      await service.generate(baseParams);

      expect(mockUsageService.recordUsage).toHaveBeenCalledWith(
        "user-1",
        "proj-1",
        true,
        undefined,
      );
    });
  });

  describe("generateImageByPublicId", () => {
    it("should return PNG buffer on cache miss", async () => {
      const result = await service.generateImageByPublicId(
        "abc123",
        "https://example.com",
        "gradient_dark",
      );

      expect(result).toBeInstanceOf(Buffer);
      expect(result[0]).toBe(0x89);
      expect(mockScraper.extractMetadata).toHaveBeenCalled();
      expect(mockTemplateService.render).toHaveBeenCalled();
      expect(mockStorage.store).toHaveBeenCalled();
    });

    it("should return cached buffer from storage on cache hit", async () => {
      (mockPrisma.generatedImage.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "img-cached",
        imageUrl: "/uploads/images/cached.png",
        cdnUrl: null,
        serveCount: 3,
      });

      const result = await service.generateImageByPublicId(
        "abc123",
        "https://example.com",
        "gradient_dark",
      );

      expect(result).toBeInstanceOf(Buffer);
      expect(mockStorage.get).toHaveBeenCalled();
      expect(mockScraper.extractMetadata).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError for unknown publicId", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      await expect(
        service.generateImageByPublicId("unknown", "https://example.com", "gradient_dark"),
      ).rejects.toThrow("Project not found");
    });

    it("should reject URLs not matching project domains", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "proj-1",
        userId: "user-1",
        publicId: "abc123",
        domains: ["allowed.com"],
        user: { id: "user-1" },
      });

      await expect(
        service.generateImageByPublicId("abc123", "https://evil.com/page", "gradient_dark"),
      ).rejects.toThrow("Domain not allowed");
    });
  });

  describe("invalidateCache", () => {
    it("should delete image from storage and database", async () => {
      (mockPrisma.generatedImage.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "img-1",
        userId: "user-1",
        cacheKey: "abc123",
      });

      await service.invalidateCache("user-1", "abc123");

      expect(mockStorage.delete).toHaveBeenCalledWith("abc123");
      expect(mockPrisma.generatedImage.delete).toHaveBeenCalled();
    });

    it("should throw NotFoundError if image not found", async () => {
      (mockPrisma.generatedImage.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      await expect(service.invalidateCache("user-1", "nonexistent")).rejects.toThrow(
        "Image not found",
      );
    });

    it("should throw NotFoundError if user does not own image", async () => {
      (mockPrisma.generatedImage.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "img-1",
        userId: "other-user",
        cacheKey: "abc123",
      });

      await expect(service.invalidateCache("user-1", "abc123")).rejects.toThrow("Image not found");
    });
  });
});
