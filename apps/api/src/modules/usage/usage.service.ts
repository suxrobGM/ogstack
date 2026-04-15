import { Plan, PLAN_CONFIGS } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { PlanLimitError } from "@/common/errors/http.error";
import {
  rangeOrLastDays,
  rangeOrLastMonths,
  startOfMonth,
  startOfNextMonth,
  toIsoDate,
  toYearMonth,
} from "@/common/utils/date";
import { PrismaClient } from "@/generated/prisma";
import { NotificationService } from "@/modules/notification";
import type { DateRange } from "@/types/pagination";
import type { UsageDailyEntry, UsageHistoryEntry, UsageStats } from "./usage.schema";

interface RecordUsageOptions {
  cacheHit?: boolean;
  apiKeyId?: string | null;
  aiEnabled?: boolean;
  aiProModel?: boolean;
  isAudit?: boolean;
}

@singleton()
export class UsageService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly notificationService: NotificationService,
  ) {}

  async enforceAiImageQuota(userId: string, useProModel = false): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const plan = user?.plan ?? Plan.FREE;
    const config = PLAN_CONFIGS[plan];

    const totals = await this.sumCurrentMonth(userId);

    if (totals.aiImageCount >= config.aiImageLimit) {
      await this.notifyQuotaExceeded(
        userId,
        `You've reached your monthly AI image limit of ${config.aiImageLimit}. Upgrade for more.`,
      );
      throw new PlanLimitError(
        `Monthly AI image quota of ${config.aiImageLimit} exceeded. Upgrade your plan for more.`,
      );
    }

    if (useProModel) {
      if (config.aiImageProLimit <= 0) {
        throw new PlanLimitError(
          "Your plan does not include Flux 2 Pro model access. Upgrade to Pro to use it.",
        );
      }
      if (totals.aiProImageCount >= config.aiImageProLimit) {
        throw new PlanLimitError(
          `Monthly Flux 2 Pro quota of ${config.aiImageProLimit} exceeded. Your remaining AI quota will use the standard model.`,
        );
      }
    }
  }

  async enforceAiAuditQuota(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const plan = user?.plan ?? Plan.FREE;
    const config = PLAN_CONFIGS[plan];

    if (config.aiAuditLimit <= 0) {
      throw new PlanLimitError(
        "AI audit recommendations are not available on your plan. Upgrade to Plus or Pro.",
      );
    }

    const totals = await this.sumCurrentMonth(userId);
    if (totals.aiAuditCount >= config.aiAuditLimit) {
      await this.notifyQuotaExceeded(
        userId,
        `You've reached your monthly AI audit limit of ${config.aiAuditLimit}. Upgrade for more.`,
      );
      throw new PlanLimitError(
        `Monthly AI audit quota of ${config.aiAuditLimit} exceeded. Upgrade your plan for more.`,
      );
    }
  }

  async recordUsage(
    userId: string,
    projectId: string | null,
    options: RecordUsageOptions = {},
  ): Promise<void> {
    const {
      cacheHit = false,
      apiKeyId = null,
      aiEnabled = false,
      aiProModel = false,
      isAudit = false,
    } = options;

    const periodStart = startOfMonth(new Date());
    const existing = await this.findUsageRecord(userId, projectId, apiKeyId, periodStart);
    const countsAsAi = !cacheHit && aiEnabled;
    const countsAsAiPro = countsAsAi && aiProModel;

    const increments: Record<string, { increment: number }> = {};
    if (isAudit) {
      increments.aiAuditCount = { increment: 1 };
    } else if (cacheHit) {
      increments.cacheHits = { increment: 1 };
    } else {
      increments.imageCount = { increment: 1 };
      if (countsAsAi) increments.aiImageCount = { increment: 1 };
      if (countsAsAiPro) increments.aiProImageCount = { increment: 1 };
    }

    if (existing) {
      await this.prisma.usageRecord.update({
        where: { id: existing.id },
        data: increments,
      });
    } else {
      await this.prisma.usageRecord.create({
        data: {
          userId,
          projectId,
          apiKeyId,
          periodStart,
          periodEnd: startOfNextMonth(periodStart),
          imageCount: !isAudit && !cacheHit ? 1 : 0,
          aiImageCount: countsAsAi ? 1 : 0,
          aiProImageCount: countsAsAiPro ? 1 : 0,
          aiAuditCount: isAudit ? 1 : 0,
          cacheHits: cacheHit ? 1 : 0,
        },
      });
    }

    if (!cacheHit && (aiEnabled || isAudit)) {
      await this.checkUsageThreshold(userId);
    }
  }

  private async checkUsageThreshold(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const plan = user?.plan ?? Plan.FREE;
    const config = PLAN_CONFIGS[plan];

    const totals = await this.sumCurrentMonth(userId);
    const periodStart = startOfMonth(new Date());

    const aiThreshold = Math.floor(config.aiImageLimit * 0.8);
    const auditThreshold = Math.floor(config.aiAuditLimit * 0.8);

    const nearAi = config.aiImageLimit > 0 && totals.aiImageCount >= aiThreshold;
    const nearAudit = config.aiAuditLimit > 0 && totals.aiAuditCount >= auditThreshold;

    if (!nearAi && !nearAudit) return;

    const existing = await this.prisma.notification.findFirst({
      where: {
        userId,
        type: "USAGE_ALERT",
        createdAt: { gte: periodStart },
      },
    });
    if (existing) return;

    const parts: string[] = [];
    if (nearAi) {
      parts.push(`${config.aiImageLimit - totals.aiImageCount} AI images remaining`);
    }
    if (nearAudit) {
      parts.push(`${config.aiAuditLimit - totals.aiAuditCount} AI audits remaining`);
    }

    await this.notificationService.create({
      userId,
      type: "USAGE_ALERT",
      title: "Approaching quota limit",
      message: `${parts.join(", ")} this month.`,
      actionUrl: "/billing",
    });
  }

  private async notifyQuotaExceeded(userId: string, message: string): Promise<void> {
    await this.notificationService.create({
      userId,
      type: "QUOTA_EXCEEDED",
      title: "Monthly quota exceeded",
      message,
      actionUrl: "/billing",
    });
  }

  async getUsageStats(userId: string, range: DateRange = {}): Promise<UsageStats> {
    const { from } = rangeOrLastMonths(range, 1);

    const [user, totals] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      }),
      this.sumRange(userId, from, new Date()),
    ]);

    const plan = user?.plan ?? Plan.FREE;
    const config = PLAN_CONFIGS[plan];

    return {
      period: toYearMonth(from),
      plan,
      used: totals.imageCount,
      aiImageCount: totals.aiImageCount,
      aiImageLimit: config.aiImageLimit,
      aiProImageCount: totals.aiProImageCount,
      aiProImageLimit: config.aiImageProLimit,
      aiAuditCount: totals.aiAuditCount,
      aiAuditLimit: config.aiAuditLimit,
      cacheHits: totals.cacheHits,
    };
  }

  async getUsageHistory(userId: string, range: DateRange = {}): Promise<UsageHistoryEntry[]> {
    const { from, to } = rangeOrLastMonths(range, 6);

    const records = await this.prisma.usageRecord.findMany({
      where: { userId, periodStart: { gte: from, lte: to } },
      select: { periodStart: true, imageCount: true, aiImageCount: true, cacheHits: true },
    });

    const byPeriod = new Map<
      string,
      { imageCount: number; aiImageCount: number; cacheHits: number }
    >();

    for (const r of records) {
      const key = toYearMonth(r.periodStart);
      const existing = byPeriod.get(key);
      if (existing) {
        existing.imageCount += r.imageCount;
        existing.aiImageCount += r.aiImageCount;
        existing.cacheHits += r.cacheHits;
      } else {
        byPeriod.set(key, {
          imageCount: r.imageCount,
          aiImageCount: r.aiImageCount,
          cacheHits: r.cacheHits,
        });
      }
    }

    const result: UsageHistoryEntry[] = [];
    const cursor = startOfMonth(from);
    const end = startOfMonth(to);

    while (cursor <= end) {
      const period = toYearMonth(cursor);
      const agg = byPeriod.get(period) ?? { imageCount: 0, aiImageCount: 0, cacheHits: 0 };
      result.push({ period, ...agg });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return result;
  }

  async getDailyUsage(userId: string, range: DateRange = {}): Promise<UsageDailyEntry[]> {
    const { from, to } = rangeOrLastDays(range, 30);

    const images = await this.prisma.image.findMany({
      where: { userId, createdAt: { gte: from, lt: to } },
      select: { createdAt: true, aiEnabled: true },
    });

    const byDate = new Map<string, { imageCount: number; aiImageCount: number }>();
    for (const img of images) {
      const key = toIsoDate(img.createdAt);
      const existing = byDate.get(key);
      if (existing) {
        existing.imageCount += 1;
        if (img.aiEnabled) existing.aiImageCount += 1;
      } else {
        byDate.set(key, { imageCount: 1, aiImageCount: img.aiEnabled ? 1 : 0 });
      }
    }

    const result: UsageDailyEntry[] = [];
    const days = Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));

    for (let i = 0; i < days; i++) {
      const bucketFrom = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
      const key = toIsoDate(bucketFrom);
      const agg = byDate.get(key) ?? { imageCount: 0, aiImageCount: 0 };
      result.push({ date: bucketFrom, ...agg });
    }
    return result;
  }

  private findUsageRecord(
    userId: string,
    projectId: string | null,
    apiKeyId: string | null,
    periodStart: Date,
  ) {
    return this.prisma.usageRecord.findFirst({
      where: { userId, projectId, apiKeyId, periodStart },
    });
  }

  private async sumCurrentMonth(userId: string) {
    return this.sumRange(userId, startOfMonth(new Date()), new Date());
  }

  private async sumRange(userId: string, from: Date, to: Date) {
    const records = await this.prisma.usageRecord.findMany({
      where: { userId, periodStart: { gte: from, lte: to } },
      select: {
        imageCount: true,
        aiImageCount: true,
        aiProImageCount: true,
        aiAuditCount: true,
        cacheHits: true,
      },
    });
    return records.reduce(
      (acc, r) => ({
        imageCount: acc.imageCount + r.imageCount,
        aiImageCount: acc.aiImageCount + r.aiImageCount,
        aiProImageCount: acc.aiProImageCount + r.aiProImageCount,
        aiAuditCount: acc.aiAuditCount + r.aiAuditCount,
        cacheHits: acc.cacheHits + r.cacheHits,
      }),
      { imageCount: 0, aiImageCount: 0, aiProImageCount: 0, aiAuditCount: 0, cacheHits: 0 },
    );
  }
}
