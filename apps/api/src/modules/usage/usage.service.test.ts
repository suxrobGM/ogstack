import { Plan } from "@ogstack/shared";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PlanLimitError } from "@/common/errors/http.error";
import { PrismaClient } from "@/generated/prisma";
import { NotificationService } from "@/modules/notification";
import { UsageService } from "./usage.service";

function createMockPrisma() {
  return {
    user: {
      findUnique: mock(() => Promise.resolve({ plan: Plan.FREE })),
    },
    usageRecord: {
      findUnique: mock(() => Promise.resolve(null)),
      findFirst: mock(() => Promise.resolve(null)),
      findMany: mock(() => Promise.resolve([])),
      create: mock(() => Promise.resolve({})),
      update: mock(() => Promise.resolve({})),
      upsert: mock(() => Promise.resolve({})),
    },
    notification: {
      create: mock(() => Promise.resolve({})),
      findFirst: mock(() => Promise.resolve(null)),
    },
  } as unknown as PrismaClient;
}

describe("UsageService", () => {
  let service: UsageService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    container.registerInstance(NotificationService, {
      create: mock(() => Promise.resolve({})),
    } as unknown as NotificationService);
    service = container.resolve(UsageService);
  });

  describe("enforceQuota", () => {
    it("should allow when under quota", async () => {
      (mockPrisma.usageRecord.findFirst as ReturnType<typeof mock>).mockResolvedValue({
        imageCount: 49,
      });

      await service.enforceQuota("user-1", "proj-1");
    });

    it("should throw PlanLimitError when quota exceeded", async () => {
      (mockPrisma.usageRecord.findFirst as ReturnType<typeof mock>).mockResolvedValue({
        imageCount: 50,
      });

      try {
        await service.enforceQuota("user-1", "proj-1");
        throw new Error("expected PlanLimitError");
      } catch (error) {
        expect(error).toBeInstanceOf(PlanLimitError);
        expect((error as PlanLimitError).code).toBe("PLAN_LIMIT_EXCEEDED");
        expect((error as PlanLimitError).statusCode).toBe(403);
      }
    });

    it("should use PRO quota for PRO users", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({ plan: "PRO" });
      (mockPrisma.usageRecord.findFirst as ReturnType<typeof mock>).mockResolvedValue({
        imageCount: 50,
      });

      await service.enforceQuota("user-1", "proj-1");
    });

    it("should skip quota check for ENTERPRISE plan", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        plan: "ENTERPRISE",
      });

      await service.enforceQuota("user-1", "proj-1");
      expect(mockPrisma.usageRecord.findFirst).not.toHaveBeenCalled();
    });

    it("should default to FREE quota for unknown plan", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      (mockPrisma.usageRecord.findFirst as ReturnType<typeof mock>).mockResolvedValue({
        imageCount: 50,
      });

      expect(service.enforceQuota("user-1", "proj-1")).rejects.toThrow("quota");
    });
  });

  describe("recordUsage", () => {
    it("should create usage for cache miss when no record exists", async () => {
      await service.recordUsage("user-1", "proj-1", false);

      expect(mockPrisma.usageRecord.create).toHaveBeenCalled();
      const call = (mockPrisma.usageRecord.create as ReturnType<typeof mock>).mock.calls[0]![0] as {
        data: { imageCount: number; cacheHits: number };
      };
      expect(call.data.imageCount).toBe(1);
      expect(call.data.cacheHits).toBe(0);
    });

    it("should create usage for cache hit when no record exists", async () => {
      await service.recordUsage("user-1", "proj-1", true);

      const call = (mockPrisma.usageRecord.create as ReturnType<typeof mock>).mock.calls[0]![0] as {
        data: { imageCount: number; cacheHits: number };
      };
      expect(call.data.imageCount).toBe(0);
      expect(call.data.cacheHits).toBe(1);
    });

    it("should pass apiKeyId when provided", async () => {
      await service.recordUsage("user-1", "proj-1", false, "key-1");

      const call = (mockPrisma.usageRecord.create as ReturnType<typeof mock>).mock.calls[0]![0] as {
        data: { apiKeyId: string | null };
      };
      expect(call.data.apiKeyId).toBe("key-1");
    });
  });

  describe("getUsageStats", () => {
    it("should return zero usage when no records exist", async () => {
      const result = await service.getUsageStats("user-1");

      expect(result.used).toBe(0);
      expect(result.remaining).toBe(50);
      expect(result.quota).toBe(50);
      expect(result.plan).toBe(Plan.FREE);
      expect(result.aiImageCount).toBe(0);
      expect(result.cacheHits).toBe(0);
    });

    it("should aggregate usage across multiple records", async () => {
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { imageCount: 10, aiImageCount: 2, cacheHits: 5 },
        { imageCount: 15, aiImageCount: 3, cacheHits: 8 },
      ]);

      const result = await service.getUsageStats("user-1");

      expect(result.used).toBe(25);
      expect(result.remaining).toBe(25);
      expect(result.aiImageCount).toBe(5);
      expect(result.cacheHits).toBe(13);
    });

    it("should use correct quota for PRO plan", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({ plan: "PRO" });

      const result = await service.getUsageStats("user-1");

      expect(result.plan).toBe("PRO");
      expect(result.quota).toBe(500);
      expect(result.remaining).toBe(500);
    });

    it("should return -1 remaining for ENTERPRISE plan", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        plan: "ENTERPRISE",
      });

      const result = await service.getUsageStats("user-1");

      expect(result.quota).toBe(-1);
      expect(result.remaining).toBe(-1);
    });

    it("should filter records by provided date range", async () => {
      const from = new Date("2025-06-01T00:00:00.000Z");
      const to = new Date("2025-06-01T00:00:00.000Z");
      await service.getUsageStats("user-1", { from, to });

      const call = (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mock
        .calls[0] as any[];
      expect(call[0].where.periodStart).toEqual({ gte: from, lte: to });
    });

    it("should not return negative remaining", async () => {
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { imageCount: 60, aiImageCount: 0, cacheHits: 0 },
      ]);

      const result = await service.getUsageStats("user-1");

      expect(result.remaining).toBe(0);
    });
  });
});
