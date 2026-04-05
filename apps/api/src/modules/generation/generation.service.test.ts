import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { ScraperService, type UrlMetadata } from "@/common/services/scraper.service";
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
          imageUrl: "/images/abc.png",
          title: "OG Title",
          description: "OG Description",
          faviconUrl: "https://example.com/favicon.ico",
        }),
      ),
      update: mock(() => Promise.resolve({})),
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

describe("GenerationService", () => {
  let service: GenerationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockScraper: ReturnType<typeof createMockScraper>;
  let mockTemplateService: ReturnType<typeof createMockTemplateService>;
  let mockUsageService: ReturnType<typeof createMockUsageService>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    mockScraper = createMockScraper();
    mockTemplateService = createMockTemplateService();
    mockUsageService = createMockUsageService();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    container.registerInstance(ScraperService, mockScraper as unknown as ScraperService);
    container.registerInstance(TemplateService, mockTemplateService as unknown as TemplateService);
    container.registerInstance(UsageService, mockUsageService as unknown as UsageService);
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
      expect(mockPrisma.generatedImage.create).toHaveBeenCalled();
      expect(mockUsageService.recordUsage).toHaveBeenCalled();
    });

    it("should return cached image on cache hit", async () => {
      const cachedImage = {
        id: "img-cached",
        imageUrl: "/images/cached.png",
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
      expect(mockPrisma.generatedImage.update).toHaveBeenCalled();
    });

    it("should throw NotFoundError if project not found", () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(service.generate(baseParams)).rejects.toThrow("Project not found");
    });

    it("should throw NotFoundError if user does not own project", () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "proj-1",
        userId: "other-user",
      });

      expect(service.generate(baseParams)).rejects.toThrow("Project not found");
    });

    it("should call enforceQuota before generating", async () => {
      await service.generate(baseParams);

      expect(mockUsageService.enforceQuota).toHaveBeenCalledWith("user-1", "proj-1", undefined);
    });

    it("should propagate ForbiddenError from quota enforcement", () => {
      (mockUsageService.enforceQuota as ReturnType<typeof mock>).mockRejectedValue(
        new Error("Monthly quota of 50 images exceeded"),
      );

      expect(service.generate(baseParams)).rejects.toThrow("quota");
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
        imageUrl: "/images/cached.png",
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
    });

    it("should throw NotFoundError for unknown publicId", () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(
        service.generateImageByPublicId("unknown", "https://example.com", "gradient_dark"),
      ).rejects.toThrow("Project not found");
    });

    it("should reject URLs not matching project domains", () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "proj-1",
        userId: "user-1",
        publicId: "abc123",
        domains: ["allowed.com"],
        user: { id: "user-1" },
      });

      expect(
        service.generateImageByPublicId("abc123", "https://evil.com/page", "gradient_dark"),
      ).rejects.toThrow("Domain not allowed");
    });
  });
});
