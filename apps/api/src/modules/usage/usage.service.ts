import { Plan } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { startOfMonth } from "@/common/utils/date";
import { PrismaClient } from "@/generated/prisma";
import type { DateRange } from "@/types/pagination";
import { UsageAnalyticsService } from "./usage-analytics.service";
import { assertAiAuditAllowed, assertAiImageAllowed } from "./usage-enforcer";
import { UsageNotifier } from "./usage-notifier";
import { UsageRepository, type UsageIncrement } from "./usage.repository";
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
    private readonly repository: UsageRepository,
    private readonly notifier: UsageNotifier,
    private readonly analytics: UsageAnalyticsService,
  ) {}

  async enforceAiImageQuota(userId: string, useProModel = false): Promise<void> {
    const plan = await this.getUserPlan(userId);
    const totals = await this.repository.sumCurrentMonth(userId);

    try {
      assertAiImageAllowed(plan, totals, useProModel);
    } catch (err) {
      await this.notifier.notifyQuotaExceeded(
        userId,
        err instanceof Error ? err.message : "Quota exceeded",
      );
      throw err;
    }
  }

  async enforceAiAuditQuota(userId: string): Promise<void> {
    const plan = await this.getUserPlan(userId);
    const totals = await this.repository.sumCurrentMonth(userId);

    try {
      assertAiAuditAllowed(plan, totals);
    } catch (err) {
      await this.notifier.notifyQuotaExceeded(
        userId,
        err instanceof Error ? err.message : "Quota exceeded",
      );
      throw err;
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

    const increments: UsageIncrement = {};
    if (isAudit) {
      increments.aiAuditCount = 1;
    } else if (cacheHit) {
      increments.cacheHits = 1;
    } else {
      increments.imageCount = 1;
      if (aiEnabled) increments.aiImageCount = 1;
      if (aiEnabled && aiProModel) increments.aiProImageCount = 1;
    }

    await this.repository.upsertIncrement(
      { userId, projectId, apiKeyId, periodStart: startOfMonth(new Date()) },
      increments,
    );

    if (!cacheHit && (aiEnabled || isAudit)) {
      const plan = await this.getUserPlan(userId);
      const totals = await this.repository.sumCurrentMonth(userId);
      await this.notifier.checkThreshold(userId, plan, totals);
    }
  }

  getUsageStats(userId: string, range: DateRange = {}): Promise<UsageStats> {
    return this.analytics.getUsageStats(userId, range);
  }

  getUsageHistory(userId: string, range: DateRange = {}): Promise<UsageHistoryEntry[]> {
    return this.analytics.getUsageHistory(userId, range);
  }

  getDailyUsage(userId: string, range: DateRange = {}): Promise<UsageDailyEntry[]> {
    return this.analytics.getDailyUsage(userId, range);
  }

  private async getUserPlan(userId: string): Promise<Plan> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    return user?.plan ?? Plan.FREE;
  }
}
