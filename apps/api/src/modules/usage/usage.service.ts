import { Plan, PLAN_CONFIGS, UNLIMITED_QUOTA } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { ForbiddenError } from "@/common/errors/http.error";
import { PrismaClient } from "@/generated/prisma";
import type { UsageStats } from "./usage.schema";

@singleton()
export class UsageService {
  constructor(private readonly prisma: PrismaClient) {}

  async enforceQuota(userId: string, projectId: string, apiKeyId?: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const quota = PLAN_CONFIGS[user?.plan ?? Plan.FREE].quota;
    if (quota < 0) return;

    const period = this.currentPeriod();
    const usage = await this.prisma.usageRecord.findUnique({
      where: {
        userId_projectId_apiKeyId_period: { userId, projectId, apiKeyId: apiKeyId ?? "", period },
      },
    });

    if (usage && usage.imageCount >= quota) {
      throw new ForbiddenError(
        `Monthly quota of ${quota} images exceeded. Upgrade your plan for more.`,
      );
    }
  }

  async recordUsage(
    userId: string,
    projectId: string,
    cacheHit: boolean,
    apiKeyId?: string,
  ): Promise<void> {
    const period = this.currentPeriod();

    await this.prisma.usageRecord.upsert({
      where: {
        userId_projectId_apiKeyId_period: {
          userId,
          projectId,
          apiKeyId: apiKeyId ?? "",
          period,
        },
      },
      create: {
        userId,
        projectId,
        apiKeyId: apiKeyId ?? null,
        period,
        imageCount: cacheHit ? 0 : 1,
        cacheHits: cacheHit ? 1 : 0,
      },
      update: cacheHit ? { cacheHits: { increment: 1 } } : { imageCount: { increment: 1 } },
    });
  }

  async getUsageStats(userId: string, period?: string): Promise<UsageStats> {
    const billingPeriod = period ?? this.currentPeriod();

    const [user, records] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      }),
      this.prisma.usageRecord.findMany({
        where: { userId, period: billingPeriod },
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
      period: billingPeriod,
      plan,
      quota,
      used: totals.imageCount,
      remaining: quota < 0 ? UNLIMITED_QUOTA : Math.max(0, quota - totals.imageCount),
      aiImageCount: totals.aiImageCount,
      cacheHits: totals.cacheHits,
    };
  }

  private currentPeriod(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  }
}
