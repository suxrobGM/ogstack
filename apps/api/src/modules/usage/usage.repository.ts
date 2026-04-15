import { singleton } from "tsyringe";
import { startOfMonth, startOfNextMonth } from "@/common/utils/date";
import { PrismaClient } from "@/generated/prisma";

export interface UsageTotals {
  imageCount: number;
  aiImageCount: number;
  aiProImageCount: number;
  aiAuditCount: number;
  cacheHits: number;
}

export interface UsageRecordKey {
  userId: string;
  projectId: string | null;
  apiKeyId: string | null;
  periodStart: Date;
}

export interface UsageIncrement {
  imageCount?: number;
  aiImageCount?: number;
  aiProImageCount?: number;
  aiAuditCount?: number;
  cacheHits?: number;
}

const EMPTY_TOTALS: UsageTotals = {
  imageCount: 0,
  aiImageCount: 0,
  aiProImageCount: 0,
  aiAuditCount: 0,
  cacheHits: 0,
};

@singleton()
export class UsageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findRecord(key: UsageRecordKey) {
    return this.prisma.usageRecord.findFirst({ where: key });
  }

  async sumRange(userId: string, from: Date, to: Date): Promise<UsageTotals> {
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
      EMPTY_TOTALS,
    );
  }

  sumCurrentMonth(userId: string): Promise<UsageTotals> {
    return this.sumRange(userId, startOfMonth(new Date()), new Date());
  }

  async upsertIncrement(key: UsageRecordKey, inc: UsageIncrement): Promise<void> {
    const existing = await this.findRecord(key);
    if (existing) {
      const data: Record<string, { increment: number }> = {};
      for (const [field, value] of Object.entries(inc)) {
        if (value) data[field] = { increment: value };
      }
      await this.prisma.usageRecord.update({ where: { id: existing.id }, data });
      return;
    }

    await this.prisma.usageRecord.create({
      data: {
        userId: key.userId,
        projectId: key.projectId,
        apiKeyId: key.apiKeyId,
        periodStart: key.periodStart,
        periodEnd: startOfNextMonth(key.periodStart),
        imageCount: inc.imageCount ?? 0,
        aiImageCount: inc.aiImageCount ?? 0,
        aiProImageCount: inc.aiProImageCount ?? 0,
        aiAuditCount: inc.aiAuditCount ?? 0,
        cacheHits: inc.cacheHits ?? 0,
      },
    });
  }
}
