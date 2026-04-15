import { Plan, PLAN_CONFIGS, UNLIMITED_QUOTA } from "@ogstack/shared";
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

@singleton()
export class UsageService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly notificationService: NotificationService,
  ) {}

  async enforceQuota(userId: string, projectId: string, apiKeyId?: string | null): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const quota = PLAN_CONFIGS[user?.plan ?? Plan.FREE].quota;
    if (quota < 0) return;

    const periodStart = startOfMonth(new Date());
    const usage = await this.findUsageRecord(userId, projectId, apiKeyId ?? null, periodStart);

    if (usage && usage.imageCount >= quota) {
      await this.notificationService.create({
        userId,
        type: "QUOTA_EXCEEDED",
        title: "Monthly quota exceeded",
        message: `You've reached your monthly limit of ${quota} images. Upgrade your plan for more.`,
        actionUrl: "/billing",
      });

      throw new PlanLimitError(
        `Monthly quota of ${quota} images exceeded. Upgrade your plan for more.`,
      );
    }
  }

  async recordUsage(
    userId: string,
    projectId: string,
    cacheHit: boolean,
    apiKeyId?: string | null,
    aiEnabled = false,
  ): Promise<void> {
    const periodStart = startOfMonth(new Date());
    const existing = await this.findUsageRecord(userId, projectId, apiKeyId ?? null, periodStart);
    const countsAsAi = !cacheHit && aiEnabled;

    if (existing) {
      await this.prisma.usageRecord.update({
        where: { id: existing.id },
        data: cacheHit
          ? { cacheHits: { increment: 1 } }
          : {
              imageCount: { increment: 1 },
              ...(countsAsAi && { aiImageCount: { increment: 1 } }),
            },
      });
    } else {
      await this.prisma.usageRecord.create({
        data: {
          userId,
          projectId,
          apiKeyId: apiKeyId ?? null,
          periodStart,
          periodEnd: startOfNextMonth(periodStart),
          imageCount: cacheHit ? 0 : 1,
          aiImageCount: countsAsAi ? 1 : 0,
          cacheHits: cacheHit ? 1 : 0,
        },
      });
    }

    if (!cacheHit) {
      await this.checkUsageThreshold(userId, projectId, apiKeyId ?? null, periodStart);
    }
  }

  private async checkUsageThreshold(
    userId: string,
    projectId: string,
    apiKeyId: string | null,
    periodStart: Date,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const quota = PLAN_CONFIGS[user?.plan ?? Plan.FREE].quota;
    if (quota < 0) {
      return;
    }

    const usage = await this.findUsageRecord(userId, projectId, apiKeyId, periodStart);

    if (!usage || usage.imageCount < Math.floor(quota * 0.8)) {
      return;
    }

    const existing = await this.prisma.notification.findFirst({
      where: {
        userId,
        type: "USAGE_ALERT",
        createdAt: { gte: periodStart },
      },
    });
    if (existing) {
      return;
    }

    const remaining = quota - usage.imageCount;
    await this.notificationService.create({
      userId,
      type: "USAGE_ALERT",
      title: "Approaching quota limit",
      message: `You have ${remaining} image${remaining === 1 ? "" : "s"} remaining this month.`,
      actionUrl: "/billing",
    });
  }

  async getUsageStats(userId: string, range: DateRange = {}): Promise<UsageStats> {
    const { from, to } = rangeOrLastMonths(range, 1);

    const [user, records] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      }),
      this.prisma.usageRecord.findMany({
        where: { userId, periodStart: { gte: from, lte: to } },
      }),
    ]);

    const plan = user?.plan ?? Plan.FREE;
    const quota = PLAN_CONFIGS[plan].quota;

    const totals = records.reduce(
      (acc, r) => ({
        imageCount: acc.imageCount + r.imageCount,
        aiImageCount: acc.aiImageCount + r.aiImageCount,
        cacheHits: acc.cacheHits + r.cacheHits,
      }),
      { imageCount: 0, aiImageCount: 0, cacheHits: 0 },
    );

    return {
      period: toYearMonth(from),
      plan,
      quota,
      used: totals.imageCount,
      remaining: quota < 0 ? UNLIMITED_QUOTA : Math.max(0, quota - totals.imageCount),
      aiImageCount: totals.aiImageCount,
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
    projectId: string,
    apiKeyId: string | null,
    periodStart: Date,
  ) {
    return this.prisma.usageRecord.findFirst({
      where: { userId, projectId, apiKeyId: apiKeyId ?? null, periodStart },
    });
  }
}
