import { singleton } from "tsyringe";
import { ForbiddenError } from "@/common/errors/http.error";
import { PrismaClient } from "@/generated/prisma";

const UNLIMITED = -1;

const PLAN_QUOTAS: Record<string, number> = {
  FREE: 50,
  PRO: 500,
  BUSINESS: 5_000,
  ENTERPRISE: UNLIMITED,
};

@singleton()
export class UsageService {
  constructor(private readonly prisma: PrismaClient) {}

  async enforceQuota(userId: string, projectId: string, apiKeyId?: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const quota = PLAN_QUOTAS[user?.plan ?? "FREE"] ?? 50;
    if (quota === UNLIMITED) return;

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

  private currentPeriod(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  }
}
