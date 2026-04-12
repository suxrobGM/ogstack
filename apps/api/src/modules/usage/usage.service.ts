import { Plan, PLAN_CONFIGS, UNLIMITED_QUOTA } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { ForbiddenError } from "@/common/errors/http.error";
import { PrismaClient } from "@/generated/prisma";
import { NotificationService } from "@/modules/notification";
import type { UsageStats } from "./usage.schema";

@singleton()
export class UsageService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly notificationService: NotificationService,
  ) {}

  async enforceQuota(userId: string, projectId: string, apiKeyId?: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const quota = PLAN_CONFIGS[user?.plan ?? Plan.FREE].quota;
    if (quota < 0) return;

    const period = this.currentPeriod();
    const usage = await this.findUsageRecord(userId, projectId, apiKeyId, period);

    if (usage && usage.imageCount >= quota) {
      await this.notificationService.create({
        userId,
        type: "QUOTA_EXCEEDED",
        title: "Monthly quota exceeded",
        message: `You've reached your monthly limit of ${quota} images. Upgrade your plan for more.`,
        actionUrl: "/billing",
      });

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
    const existing = await this.findUsageRecord(userId, projectId, apiKeyId, period);

    if (existing) {
      await this.prisma.usageRecord.update({
        where: { id: existing.id },
        data: cacheHit ? { cacheHits: { increment: 1 } } : { imageCount: { increment: 1 } },
      });
    } else {
      await this.prisma.usageRecord.create({
        data: {
          userId,
          projectId,
          apiKeyId: apiKeyId ?? null,
          period,
          imageCount: cacheHit ? 0 : 1,
          cacheHits: cacheHit ? 1 : 0,
        },
      });
    }

    if (!cacheHit) {
      await this.checkUsageThreshold(userId, projectId, apiKeyId, period);
    }
  }

  private async checkUsageThreshold(
    userId: string,
    projectId: string,
    apiKeyId: string | undefined,
    period: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const quota = PLAN_CONFIGS[user?.plan ?? Plan.FREE].quota;
    if (quota < 0) return;

    const usage = await this.findUsageRecord(userId, projectId, apiKeyId, period);

    if (!usage || usage.imageCount < Math.floor(quota * 0.8)) return;

    const existing = await this.prisma.notification.findFirst({
      where: {
        userId,
        type: "USAGE_ALERT",
        createdAt: { gte: new Date(`${period}-01`) },
      },
    });
    if (existing) return;

    const remaining = quota - usage.imageCount;
    await this.notificationService.create({
      userId,
      type: "USAGE_ALERT",
      title: "Approaching quota limit",
      message: `You have ${remaining} image${remaining === 1 ? "" : "s"} remaining this month.`,
      actionUrl: "/billing",
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

  private findUsageRecord(
    userId: string,
    projectId: string,
    apiKeyId: string | undefined,
    period: string,
  ) {
    return this.prisma.usageRecord.findFirst({
      where: { userId, projectId, apiKeyId: apiKeyId ?? null, period },
    });
  }
}
