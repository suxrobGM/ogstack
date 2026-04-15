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

  describe("enforceAiImageQuota", () => {
    it("should allow when under AI quota", async () => {
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { imageCount: 0, aiImageCount: 2, aiProImageCount: 0, aiAuditCount: 0, cacheHits: 0 },
      ]);

      await service.enforceAiImageQuota("user-1");
    });

    it("should throw when FREE AI quota exceeded", async () => {
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { imageCount: 0, aiImageCount: 3, aiProImageCount: 0, aiAuditCount: 0, cacheHits: 0 },
      ]);

      try {
        await service.enforceAiImageQuota("user-1");
        throw new Error("expected PlanLimitError");
      } catch (error) {
        expect(error).toBeInstanceOf(PlanLimitError);
      }
    });

    it("should block Pro model on Plus tier", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        plan: Plan.PLUS,
      });
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([]);

      expect(service.enforceAiImageQuota("user-1", true)).rejects.toThrow(PlanLimitError);
    });

    it("should allow Pro model on Pro tier within sub-cap", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({ plan: Plan.PRO });
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { imageCount: 0, aiImageCount: 50, aiProImageCount: 50, aiAuditCount: 0, cacheHits: 0 },
      ]);

      await service.enforceAiImageQuota("user-1", true);
    });

    it("should block Pro model on Pro tier over sub-cap", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({ plan: Plan.PRO });
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { imageCount: 0, aiImageCount: 300, aiProImageCount: 300, aiAuditCount: 0, cacheHits: 0 },
      ]);

      expect(service.enforceAiImageQuota("user-1", true)).rejects.toThrow(PlanLimitError);
    });
  });

  describe("enforceAiAuditQuota", () => {
    it("should block FREE users", async () => {
      expect(service.enforceAiAuditQuota("user-1")).rejects.toThrow(PlanLimitError);
    });

    it("should allow PLUS within quota", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        plan: Plan.PLUS,
      });
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { imageCount: 0, aiImageCount: 0, aiProImageCount: 0, aiAuditCount: 50, cacheHits: 0 },
      ]);

      await service.enforceAiAuditQuota("user-1");
    });

    it("should block PLUS over quota", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({
        plan: Plan.PLUS,
      });
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { imageCount: 0, aiImageCount: 0, aiProImageCount: 0, aiAuditCount: 100, cacheHits: 0 },
      ]);

      expect(service.enforceAiAuditQuota("user-1")).rejects.toThrow(PlanLimitError);
    });
  });

  describe("recordUsage", () => {
    it("should create usage for cache miss", async () => {
      await service.recordUsage("user-1", "proj-1");

      expect(mockPrisma.usageRecord.create).toHaveBeenCalled();
      const call = (mockPrisma.usageRecord.create as ReturnType<typeof mock>).mock.calls[0]![0] as {
        data: { imageCount: number; cacheHits: number };
      };
      expect(call.data.imageCount).toBe(1);
      expect(call.data.cacheHits).toBe(0);
    });

    it("should create cache-hit record", async () => {
      await service.recordUsage("user-1", "proj-1", { cacheHit: true });

      const call = (mockPrisma.usageRecord.create as ReturnType<typeof mock>).mock.calls[0]![0] as {
        data: { imageCount: number; cacheHits: number };
      };
      expect(call.data.imageCount).toBe(0);
      expect(call.data.cacheHits).toBe(1);
    });

    it("should pass apiKeyId when provided", async () => {
      await service.recordUsage("user-1", "proj-1", { apiKeyId: "key-1" });

      const call = (mockPrisma.usageRecord.create as ReturnType<typeof mock>).mock.calls[0]![0] as {
        data: { apiKeyId: string | null };
      };
      expect(call.data.apiKeyId).toBe("key-1");
    });

    it("should increment audit count when isAudit=true", async () => {
      await service.recordUsage("user-1", null, { isAudit: true });

      const call = (mockPrisma.usageRecord.create as ReturnType<typeof mock>).mock.calls[0]![0] as {
        data: { aiAuditCount: number; imageCount: number };
      };
      expect(call.data.aiAuditCount).toBe(1);
      expect(call.data.imageCount).toBe(0);
    });

    it("should increment aiProImageCount when aiProModel=true", async () => {
      await service.recordUsage("user-1", "proj-1", {
        aiEnabled: true,
        aiProModel: true,
      });

      const call = (mockPrisma.usageRecord.create as ReturnType<typeof mock>).mock.calls[0]![0] as {
        data: { aiImageCount: number; aiProImageCount: number };
      };
      expect(call.data.aiImageCount).toBe(1);
      expect(call.data.aiProImageCount).toBe(1);
    });
  });

  describe("getUsageStats", () => {
    it("should return zero usage with Free limits", async () => {
      const result = await service.getUsageStats("user-1");

      expect(result.used).toBe(0);
      expect(result.plan).toBe(Plan.FREE);
      expect(result.aiImageCount).toBe(0);
      expect(result.aiImageLimit).toBe(3);
      expect(result.aiProImageLimit).toBe(0);
      expect(result.aiAuditLimit).toBe(0);
      expect(result.cacheHits).toBe(0);
    });

    it("should aggregate usage across multiple records", async () => {
      (mockPrisma.usageRecord.findMany as ReturnType<typeof mock>).mockResolvedValue([
        { imageCount: 10, aiImageCount: 2, aiProImageCount: 0, aiAuditCount: 1, cacheHits: 5 },
        { imageCount: 15, aiImageCount: 3, aiProImageCount: 0, aiAuditCount: 2, cacheHits: 8 },
      ]);

      const result = await service.getUsageStats("user-1");

      expect(result.used).toBe(25);
      expect(result.aiImageCount).toBe(5);
      expect(result.aiAuditCount).toBe(3);
      expect(result.cacheHits).toBe(13);
    });

    it("should reflect Pro limits for Pro users", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue({ plan: Plan.PRO });

      const result = await service.getUsageStats("user-1");

      expect(result.plan).toBe(Plan.PRO);
      expect(result.aiImageLimit).toBe(1000);
      expect(result.aiProImageLimit).toBe(300);
      expect(result.aiAuditLimit).toBe(1000);
    });
  });
});
