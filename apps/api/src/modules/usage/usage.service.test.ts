import { Plan } from "@ogstack/shared";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { UsageService } from "./usage.service";

function createMockPrisma() {
  return {
    user: {
      findUnique: mock(() => Promise.resolve({ plan: Plan.FREE })),
    },
    usageRecord: {
      findUnique: mock(() => Promise.resolve(null)),
      findMany: mock(() => Promise.resolve([])),
      upsert: mock(() => Promise.resolve({})),
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
    service = container.resolve(UsageService);
  });

  describe("enforceQuota", () => {
    it("should allow when under quota", async () => {
      (mockPrisma.usageRecord.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        imageCount: 49,
      });

      await service.enforceQuota("user-1", "proj-1");
    });

    it("should throw ForbiddenError when quota exceeded", () => {
      (mockPrisma.usageRecord.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        imageCount: 50,
      });

      expect(service.enforceQuota("user-1", "proj-1")).rejects.toThrow("quota");
    });

    it("should use PRO quota for PRO users", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({ plan: "PRO" });
      (mockPrisma.usageRecord.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        imageCount: 50,
      });

      await service.enforceQuota("user-1", "proj-1");
    });

    it("should skip quota check for ENTERPRISE plan", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        plan: "ENTERPRISE",
      });

      await service.enforceQuota("user-1", "proj-1");
      expect(mockPrisma.usageRecord.findUnique).not.toHaveBeenCalled();
    });

    it("should default to FREE quota for unknown plan", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      (mockPrisma.usageRecord.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        imageCount: 50,
      });

      expect(service.enforceQuota("user-1", "proj-1")).rejects.toThrow("quota");
    });
  });

  describe("recordUsage", () => {
    it("should upsert usage for cache miss", async () => {
      await service.recordUsage("user-1", "proj-1", false);

      expect(mockPrisma.usageRecord.upsert).toHaveBeenCalled();
      const call = (mockPrisma.usageRecord.upsert as ReturnType<typeof mock>).mock.calls[0]![0] as {
        create: { imageCount: number; cacheHits: number };
      };
      expect(call.create.imageCount).toBe(1);
      expect(call.create.cacheHits).toBe(0);
    });

    it("should upsert usage for cache hit", async () => {
      await service.recordUsage("user-1", "proj-1", true);

      const call = (mockPrisma.usageRecord.upsert as ReturnType<typeof mock>).mock.calls[0]![0] as {
        create: { imageCount: number; cacheHits: number };
      };
      expect(call.create.imageCount).toBe(0);
      expect(call.create.cacheHits).toBe(1);
    });

    it("should pass apiKeyId when provided", async () => {
      await service.recordUsage("user-1", "proj-1", false, "key-1");

      const call = (mockPrisma.usageRecord.upsert as ReturnType<typeof mock>).mock.calls[0]![0] as {
        create: { apiKeyId: string | null };
      };
      expect(call.create.apiKeyId).toBe("key-1");
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

    it("should use provided period parameter", async () => {
      await service.getUsageStats("user-1", "2025-06");

      const call = (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mock
        .calls[0] as any[];
      expect(call[0].where.period).toBe("2025-06");
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
