import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { ImageProviderService } from "@/common/services/ai";
import { createEmptyMetadata, ScraperService, type UrlMetadata } from "@/common/services/scraper";
import { ImageStorageService } from "@/common/services/storage";
import { WatermarkService } from "@/common/services/watermark";
import { PrismaClient } from "@/generated/prisma";
import { PageAnalysisService } from "@/modules/page-analysis";
import { TemplateService } from "@/modules/template/template.service";
import { UsageService } from "@/modules/usage/usage.service";
import { ImageGenerationService } from "./generation.service";

const MOCK_METADATA: UrlMetadata = {
  ...createEmptyMetadata("https://example.com"),
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
          domains: ["example.com"],
          user: { id: "user-1", plan: "PRO" },
        }),
      ),
    },
    image: {
      findUnique: mock(() => Promise.resolve(null)),
      findFirst: mock(() => Promise.resolve(null)),
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
    user: {
      findUnique: mock(() => Promise.resolve({ plan: "PRO" })),
    },
  } as unknown as PrismaClient;
}

function createMockWatermarkService() {
  return {
    apply: mock((buf: Buffer) => Promise.resolve(buf)),
  } as unknown as WatermarkService;
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
    enforceAiImageQuota: mock(() => Promise.resolve()),
    enforceAiAuditQuota: mock(() => Promise.resolve()),
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

function createMockPageAnalysisService() {
  return {
    getPageContext: mock(() => Promise.resolve({ metadata: MOCK_METADATA, ai: null })),
  } as unknown as PageAnalysisService;
}

function createMockImageProviderService() {
  return {
    isEnabledForModel: mock(() => false),
    generate: mock(() => Promise.resolve(MOCK_PNG)),
  } as unknown as ImageProviderService;
}

describe("ImageGenerationService", () => {
  let service: ImageGenerationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockScraper: ReturnType<typeof createMockScraper>;
  let mockTemplateService: ReturnType<typeof createMockTemplateService>;
  let mockUsageService: ReturnType<typeof createMockUsageService>;
  let mockStorage: ReturnType<typeof createMockStorageService>;
  let mockWatermark: ReturnType<typeof createMockWatermarkService>;
  let mockPageAnalysis: ReturnType<typeof createMockPageAnalysisService>;
  let mockImageProvider: ReturnType<typeof createMockImageProviderService>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    mockScraper = createMockScraper();
    mockTemplateService = createMockTemplateService();
    mockUsageService = createMockUsageService();
    mockStorage = createMockStorageService();
    mockWatermark = createMockWatermarkService();
    mockPageAnalysis = createMockPageAnalysisService();
    mockImageProvider = createMockImageProviderService();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    container.registerInstance(ScraperService, mockScraper as unknown as ScraperService);
    container.registerInstance(TemplateService, mockTemplateService as unknown as TemplateService);
    container.registerInstance(UsageService, mockUsageService as unknown as UsageService);
    container.registerInstance(ImageStorageService, mockStorage as unknown as ImageStorageService);
    container.registerInstance(WatermarkService, mockWatermark as unknown as WatermarkService);
    container.registerInstance(
      PageAnalysisService,
      mockPageAnalysis as unknown as PageAnalysisService,
    );
    container.registerInstance(
      ImageProviderService,
      mockImageProvider as unknown as ImageProviderService,
    );
    service = container.resolve(ImageGenerationService);
  });

  describe("generate", () => {
    const baseParams = {
      userId: "user-1",
      projectId: "proj-1",
      url: "https://example.com",
      template: "aurora" as const,
    };

    it("should generate a new image on cache miss", async () => {
      const result = await service.generate(baseParams);

      expect(result.cached).toBe(false);
      expect(result.imageUrl).toBeDefined();
      expect(result.source.title).toBe("OG Title");
      expect(mockTemplateService.render).toHaveBeenCalled();
      expect(mockStorage.store).toHaveBeenCalled();
      expect(mockPrisma.image.create).toHaveBeenCalled();
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
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue(cachedImage);

      const result = await service.generate(baseParams);

      expect(result.cached).toBe(true);
      expect(result.imageUrl).toBe("https://cdn.example.com/cached.png");
      expect(result.source.title).toBe("Cached Title");
      expect(mockTemplateService.render).not.toHaveBeenCalled();
      expect(mockStorage.store).not.toHaveBeenCalled();
      expect(mockPrisma.image.update).toHaveBeenCalled();
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

    it("should record usage for cache misses", async () => {
      await service.generate(baseParams);

      expect(mockUsageService.recordUsage).toHaveBeenCalledWith(
        "user-1",
        "proj-1",
        expect.objectContaining({ cacheHit: false }),
      );
    });

    it("should record cache hits in usage", async () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue({
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
        expect.objectContaining({ cacheHit: true }),
      );
    });
  });

  describe("generateByPublicId", () => {
    const publicParams = {
      publicId: "abc123",
      url: "https://example.com",
      template: "aurora",
    };

    it("should return PNG buffer on cache miss", async () => {
      const result = await service.generateByPublicId(publicParams);

      expect(result).toBeInstanceOf(Buffer);
      expect(result[0]).toBe(0x89);
      expect(mockTemplateService.render).toHaveBeenCalled();
      expect(mockStorage.store).toHaveBeenCalled();
    });

    it("should return cached buffer from storage on cache hit", async () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "img-cached",
        imageUrl: "/uploads/images/cached.png",
        cdnUrl: null,
        serveCount: 3,
        generatedOnPlan: "FREE",
      });

      const result = await service.generateByPublicId(publicParams);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockStorage.get).toHaveBeenCalled();
      expect(mockTemplateService.render).not.toHaveBeenCalled();
    });

    it("evicts stale row and regenerates when blob is missing", async () => {
      (mockPrisma.image.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "img-cached",
        cacheKey: "cache-abc",
        kind: "OG",
        generatedOnPlan: "FREE",
      });
      (mockStorage.get as ReturnType<typeof mock>).mockResolvedValue(null);

      const result = await service.generateByPublicId(publicParams);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockPrisma.image.delete).toHaveBeenCalled();
      expect(mockTemplateService.render).toHaveBeenCalled();
    });

    it("should throw NotFoundError for unknown publicId", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      await expect(
        service.generateByPublicId({ ...publicParams, publicId: "unknown" }),
      ).rejects.toThrow("Project not found");
    });

    it("should reject URLs not matching project domains", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "proj-1",
        userId: "user-1",
        publicId: "abc123",
        domains: ["allowed.com"],
        user: { id: "user-1", plan: "PRO" },
      });

      await expect(
        service.generateByPublicId({ ...publicParams, url: "https://evil.com/page" }),
      ).rejects.toThrow("is not allowed");
    });
  });
});
