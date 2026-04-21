import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { createEmptyMetadata, ScraperService } from "@/common/services/scraper";
import { PrismaClient } from "@/generated/prisma";
import { PageAnalysisAnalyzer } from "./page-analysis.analyzer";
import { PageAnalysisRepository } from "./page-analysis.repository";
import { PageAnalysisService } from "./page-analysis.service";

function createMockScraper() {
  return {
    extractMetadata: mock(() => Promise.resolve(createEmptyMetadata("https://example.com"))),
  } as unknown as ScraperService;
}

function createMockAnalyzer() {
  return {
    isEnabled: mock(() => true),
    getActiveProvider: mock(() => ({ id: "anthropic", model: "claude" })),
    analyzePage: mock(() =>
      Promise.resolve({
        title: "t",
        summary: "s",
        pageTheme: "product",
        topics: ["dev"],
        keyPoints: [],
        imagePrompt: {
          headline: "h",
          tagline: null,
          backgroundKeywords: ["a", "b"],
          mood: "bold",
          suggestedAccent: null,
        },
        brandHints: { palette: [], industry: null },
      }),
    ),
    variationPrompt: mock(() => Promise.resolve("new prompt")),
  } as unknown as PageAnalysisAnalyzer;
}

function createMockRepository() {
  return {
    find: mock(() => Promise.resolve(null)),
    upsert: mock(() => Promise.resolve()),
  } as unknown as PageAnalysisRepository;
}

function createMockPrisma() {
  return {
    user: { findUnique: mock(() => Promise.resolve({ plan: "FREE" })) },
  } as unknown as PrismaClient;
}

describe("PageAnalysisService", () => {
  let service: PageAnalysisService;
  let scraper: ReturnType<typeof createMockScraper>;
  let analyzer: ReturnType<typeof createMockAnalyzer>;
  let repo: ReturnType<typeof createMockRepository>;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    container.clearInstances();
    scraper = createMockScraper();
    analyzer = createMockAnalyzer();
    repo = createMockRepository();
    prisma = createMockPrisma();
    container.registerInstance(ScraperService, scraper);
    container.registerInstance(PageAnalysisAnalyzer, analyzer);
    container.registerInstance(PageAnalysisRepository, repo);
    container.registerInstance(PrismaClient, prisma);
    service = container.resolve(PageAnalysisService);
  });

  describe("analyze", () => {
    it("runs full AI analysis when cache missing and persists result", async () => {
      const result = await service.analyze({ url: "https://example.com", userId: "u1" });

      expect(result.cached).toBe(false);
      expect(result.ai).not.toBeNull();
      expect(analyzer.analyzePage).toHaveBeenCalled();
      expect(repo.upsert).toHaveBeenCalled();
    });

    it("returns cached analysis when repository has a hit", async () => {
      const cachedAi = { title: "cached" };
      (repo.find as ReturnType<typeof mock>).mockResolvedValueOnce(cachedAi);

      const result = await service.analyze({ url: "https://example.com", userId: "u1" });

      expect(result.cached).toBe(true);
      expect(result.ai).toEqual(cachedAi as unknown as typeof result.ai);
      expect(analyzer.analyzePage).not.toHaveBeenCalled();
      expect(repo.upsert).not.toHaveBeenCalled();
    });

    it("returns null ai when analyzer is disabled", async () => {
      (analyzer.isEnabled as ReturnType<typeof mock>).mockReturnValue(false);

      const result = await service.analyze({ url: "https://example.com", userId: "u1" });

      expect(result.ai).toBeNull();
      expect(result.cached).toBe(false);
      expect(analyzer.analyzePage).not.toHaveBeenCalled();
    });

    it("returns null ai when fullOverride is set", async () => {
      const result = await service.analyze({
        url: "https://example.com",
        userId: "u1",
        fullOverride: true,
      });
      expect(result.ai).toBeNull();
    });

    it("returns null ai when skipAi is true", async () => {
      const result = await service.analyze({
        url: "https://example.com",
        userId: "u1",
        skipAi: true,
      });
      expect(result.ai).toBeNull();
    });

    it("returns null ai when analyzer returns null (transport failure)", async () => {
      (analyzer.analyzePage as ReturnType<typeof mock>).mockResolvedValueOnce(null);
      const result = await service.analyze({ url: "https://example.com", userId: "u1" });
      expect(result.ai).toBeNull();
      expect(result.cached).toBe(false);
      expect(repo.upsert).not.toHaveBeenCalled();
    });
  });

  describe("getPageContext", () => {
    it("returns metadata and ai, skipping upsert when cacheOnly on miss", async () => {
      const result = await service.getPageContext({
        url: "https://example.com",
        userId: "u1",
        cacheOnly: true,
      });
      expect(result.ai).toBeNull();
      expect(analyzer.analyzePage).not.toHaveBeenCalled();
    });

    it("returns cached ai when hit", async () => {
      (repo.find as ReturnType<typeof mock>).mockResolvedValueOnce({ title: "cached" });
      const result = await service.getPageContext({
        url: "https://example.com",
        userId: "u1",
        cacheOnly: true,
      });
      expect(result.ai).toEqual({ title: "cached" } as unknown as typeof result.ai);
    });
  });

  describe("refreshImagePrompt", () => {
    it("returns null when analyzer disabled", async () => {
      (analyzer.isEnabled as ReturnType<typeof mock>).mockReturnValue(false);
      const result = await service.refreshImagePrompt({
        kind: "og",
        ai: {} as never,
        metadata: createEmptyMetadata("https://example.com"),
        previousPrompt: null,
      });
      expect(result).toBeNull();
    });

    it("delegates to analyzer when enabled", async () => {
      const result = await service.refreshImagePrompt({
        kind: "og",
        ai: {} as never,
        metadata: createEmptyMetadata("https://example.com"),
        previousPrompt: "old",
      });
      expect(result).toBe("new prompt");
      expect(analyzer.variationPrompt).toHaveBeenCalled();
    });
  });
});
