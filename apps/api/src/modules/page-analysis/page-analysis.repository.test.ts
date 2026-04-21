import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { createEmptyMetadata } from "@/common/services/scraper";
import { PrismaClient } from "@/generated/prisma";
import { PageAnalysisRepository } from "./page-analysis.repository";

function createMockPrisma() {
  return {
    pageAnalysis: {
      findUnique: mock(() => Promise.resolve(null)),
      delete: mock(() => Promise.resolve()),
      upsert: mock(() => Promise.resolve()),
    },
  } as unknown as PrismaClient;
}

describe("PageAnalysisRepository", () => {
  let repo: PageAnalysisRepository;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    repo = container.resolve(PageAnalysisRepository);
  });

  describe("find", () => {
    it("returns null when no row exists", async () => {
      const result = await repo.find("some-key");
      expect(result).toBeNull();
    });

    it("returns the cached ai when row is fresh", async () => {
      const ai = { title: "hit" };
      (mockPrisma.pageAnalysis.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "r1",
        ai,
        expiresAt: new Date(Date.now() + 60_000),
      });
      const result = await repo.find("key");
      expect(result).toEqual(ai as unknown as typeof result);
    });

    it("evicts and returns null for expired rows", async () => {
      (mockPrisma.pageAnalysis.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "r1",
        ai: { foo: "bar" },
        expiresAt: new Date(Date.now() - 60_000),
      });

      const result = await repo.find("key");
      expect(result).toBeNull();
      expect(mockPrisma.pageAnalysis.delete).toHaveBeenCalledWith({ where: { id: "r1" } });
    });

    it("returns null and swallows prisma errors", async () => {
      (mockPrisma.pageAnalysis.findUnique as ReturnType<typeof mock>).mockRejectedValue(
        new Error("db down"),
      );
      const result = await repo.find("key");
      expect(result).toBeNull();
    });

    it("returns null silently when eviction fails", async () => {
      (mockPrisma.pageAnalysis.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        id: "r1",
        ai: { foo: "bar" },
        expiresAt: new Date(Date.now() - 60_000),
      });
      (mockPrisma.pageAnalysis.delete as ReturnType<typeof mock>).mockRejectedValue(
        new Error("evict err"),
      );
      const result = await repo.find("key");
      expect(result).toBeNull();
    });
  });

  describe("upsert", () => {
    const input = {
      cacheKey: "ck",
      url: "https://example.com",
      userId: "u1",
      metadata: createEmptyMetadata("https://example.com"),
      ai: { title: "a" } as never,
      userPrompt: undefined,
      provider: { id: "anthropic", model: "claude" },
    };

    it("upserts into the database", async () => {
      await repo.upsert(input);
      expect(mockPrisma.pageAnalysis.upsert).toHaveBeenCalled();
    });

    it("silently logs and returns when upsert fails", async () => {
      (mockPrisma.pageAnalysis.upsert as ReturnType<typeof mock>).mockRejectedValueOnce(
        new Error("db down"),
      );

      await repo.upsert(input);
      expect(mockPrisma.pageAnalysis.upsert).toHaveBeenCalled();
    });

    it("handles missing provider info", async () => {
      await repo.upsert({ ...input, provider: null });
      expect(mockPrisma.pageAnalysis.upsert).toHaveBeenCalled();
    });

    it("hashes user prompt when present", async () => {
      await repo.upsert({ ...input, userPrompt: "make it blue" });
      expect(mockPrisma.pageAnalysis.upsert).toHaveBeenCalled();
    });
  });

  describe("buildKey", () => {
    it("returns a stable hex digest", async () => {
      const metadata = createEmptyMetadata("https://example.com");
      metadata.bodyText = "hello";
      const key1 = await PageAnalysisRepository.buildKey("https://example.com", metadata);
      const key2 = await PageAnalysisRepository.buildKey("https://example.com", metadata);
      expect(key1).toBe(key2);
      expect(key1).toMatch(/^[0-9a-f]+$/);
    });

    it("differs when prompt differs", async () => {
      const metadata = createEmptyMetadata("https://example.com");
      metadata.bodyText = "hello";
      const a = await PageAnalysisRepository.buildKey("https://example.com", metadata, "p1");
      const b = await PageAnalysisRepository.buildKey("https://example.com", metadata, "p2");
      expect(a).not.toBe(b);
    });
  });
});
