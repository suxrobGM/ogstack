import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { UsageAnalyticsService } from "./usage-analytics.service";
import { UsageRepository } from "./usage.repository";

function createMockPrisma() {
  return {
    user: {
      findUnique: mock(() => Promise.resolve({ plan: "FREE" })),
    },
    usageRecord: {
      findMany: mock(() => Promise.resolve([])),
    },
    image: {
      findMany: mock(() => Promise.resolve([])),
    },
  } as unknown as PrismaClient;
}

function createMockRepository() {
  return {
    sumRange: mock(() =>
      Promise.resolve({
        imageCount: 10,
        aiImageCount: 5,
        aiProImageCount: 1,
        aiAuditCount: 2,
        cacheHits: 3,
      }),
    ),
  } as unknown as UsageRepository;
}

describe("UsageAnalyticsService", () => {
  let service: UsageAnalyticsService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockRepo: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    mockRepo = createMockRepository();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    container.registerInstance(UsageRepository, mockRepo as unknown as UsageRepository);
    service = container.resolve(UsageAnalyticsService);
  });

  describe("getUsageStats", () => {
    it("returns stats with user's plan and totals", async () => {
      const result = await service.getUsageStats("user-1");
      expect(result.plan).toBe("FREE");
      expect(result.used).toBe(10);
      expect(result.aiImageCount).toBe(5);
      expect(result.aiProImageCount).toBe(1);
      expect(result.aiAuditCount).toBe(2);
      expect(result.cacheHits).toBe(3);
      expect(result.period).toMatch(/^\d{4}-\d{2}$/);
    });

    it("defaults to FREE plan when user not found", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      const result = await service.getUsageStats("user-1");
      expect(result.plan).toBe("FREE");
    });

    it("uses plan limits from PLAN_CONFIGS", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({ plan: "PRO" });
      const result = await service.getUsageStats("user-1");
      expect(result.plan).toBe("PRO");
      expect(result.aiImageLimit).toBeGreaterThan(0);
    });

    it("uses provided date range when given", async () => {
      const from = new Date("2026-01-01T00:00:00.000Z");
      const to = new Date("2026-02-01T00:00:00.000Z");
      await service.getUsageStats("user-1", { from, to });
      const call = (mockRepo.sumRange as ReturnType<typeof mock>).mock.calls[0] as unknown[];
      expect(call[0]).toBe("user-1");
      expect(call[1]).toEqual(from);
    });
  });

  describe("getUsageHistory", () => {
    it("returns one entry per month in range", async () => {
      const records = [
        {
          periodStart: new Date("2026-01-01T00:00:00Z"),
          imageCount: 3,
          aiImageCount: 1,
          cacheHits: 0,
        },
        {
          periodStart: new Date("2026-01-15T00:00:00Z"),
          imageCount: 2,
          aiImageCount: 0,
          cacheHits: 1,
        },
        {
          periodStart: new Date("2026-02-01T00:00:00Z"),
          imageCount: 5,
          aiImageCount: 2,
          cacheHits: 0,
        },
      ];
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue(records);

      const result = await service.getUsageHistory("user-1", {
        from: new Date(Date.UTC(2026, 0, 1)),
        to: new Date(Date.UTC(2026, 2, 1)),
      });

      expect(result.length).toBeGreaterThanOrEqual(3);
      const jan = result.find((r) => r.period === "2026-01");
      expect(jan).toBeDefined();
      expect(jan?.imageCount).toBe(5);
      expect(jan?.aiImageCount).toBe(1);

      const feb = result.find((r) => r.period === "2026-02");
      expect(feb?.imageCount).toBe(5);
    });

    it("returns zeroed months when no records exist", async () => {
      const result = await service.getUsageHistory("user-1", {
        from: new Date(Date.UTC(2026, 0, 1)),
        to: new Date(Date.UTC(2026, 2, 1)),
      });
      expect(result.length).toBeGreaterThanOrEqual(3);
      for (const r of result) {
        expect(r.imageCount).toBe(0);
        expect(r.aiImageCount).toBe(0);
        expect(r.cacheHits).toBe(0);
      }
    });
  });

  describe("getDailyUsage", () => {
    it("groups images by UTC date, separating ai/non-ai", async () => {
      const images = [
        { createdAt: new Date("2026-04-10T10:00:00Z"), aiEnabled: true },
        { createdAt: new Date("2026-04-10T14:00:00Z"), aiEnabled: false },
        { createdAt: new Date("2026-04-11T10:00:00Z"), aiEnabled: true },
      ];
      (mockPrisma.image.findMany as ReturnType<typeof mock>).mockResolvedValue(images);

      const from = new Date(Date.UTC(2026, 3, 10));
      const to = new Date(Date.UTC(2026, 3, 12));
      const result = await service.getDailyUsage("user-1", { from, to });

      expect(result.length).toBe(2);
      expect(result[0]?.imageCount).toBe(2);
      expect(result[0]?.aiImageCount).toBe(1);
      expect(result[1]?.imageCount).toBe(1);
      expect(result[1]?.aiImageCount).toBe(1);
    });

    it("returns empty buckets when no images present", async () => {
      const from = new Date(Date.UTC(2026, 3, 10));
      const to = new Date(Date.UTC(2026, 3, 13));
      const result = await service.getDailyUsage("user-1", { from, to });
      expect(result.length).toBe(3);
      for (const r of result) {
        expect(r.imageCount).toBe(0);
        expect(r.aiImageCount).toBe(0);
      }
    });
  });
});
