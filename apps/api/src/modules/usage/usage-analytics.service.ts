import { Plan, PLAN_CONFIGS } from "@ogstack/shared";
import { singleton } from "tsyringe";
import {
  rangeOrLastDays,
  rangeOrLastMonths,
  startOfMonth,
  toIsoDate,
  toYearMonth,
} from "@/common/utils/date";
import { PrismaClient } from "@/generated/prisma";
import type { DateRange } from "@/types/pagination";
import { UsageRepository } from "./usage.repository";
import type { UsageDailyEntry, UsageHistoryEntry, UsageStats } from "./usage.schema";

const ONE_DAY = 24 * 60 * 60 * 1000;

@singleton()
export class UsageAnalyticsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly repository: UsageRepository,
  ) {}

  async getUsageStats(userId: string, range: DateRange = {}): Promise<UsageStats> {
    const { from } = rangeOrLastMonths(range, 1);

    const [user, totals] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
      this.repository.sumRange(userId, from, new Date()),
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
    const days = Math.round((to.getTime() - from.getTime()) / ONE_DAY);

    for (let i = 0; i < days; i++) {
      const bucketFrom = new Date(from.getTime() + i * ONE_DAY);
      const key = toIsoDate(bucketFrom);
      const agg = byDate.get(key) ?? { imageCount: 0, aiImageCount: 0 };
      result.push({ date: bucketFrom, ...agg });
    }
    return result;
  }
}
