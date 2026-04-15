import { Plan, PLAN_CONFIGS } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { startOfMonth } from "@/common/utils/date";
import { PrismaClient } from "@/generated/prisma";
import { NotificationService } from "@/modules/notification";
import type { UsageTotals } from "./usage.repository";

@singleton()
export class UsageNotifier {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly notificationService: NotificationService,
  ) {}

  async notifyQuotaExceeded(userId: string, message: string): Promise<void> {
    await this.notificationService.create({
      userId,
      type: "QUOTA_EXCEEDED",
      title: "Monthly quota exceeded",
      message,
      actionUrl: "/billing",
    });
  }

  /**
   * Emit a one-per-month USAGE_ALERT when the user first crosses 80% of AI image
   * or AI audit quota. Debounced by checking for an existing alert in the period.
   */
  async checkThreshold(userId: string, plan: Plan, totals: UsageTotals): Promise<void> {
    const config = PLAN_CONFIGS[plan];

    const aiThreshold = Math.floor(config.aiImageLimit * 0.8);
    const auditThreshold = Math.floor(config.aiAuditLimit * 0.8);
    const nearAi = config.aiImageLimit > 0 && totals.aiImageCount >= aiThreshold;
    const nearAudit = config.aiAuditLimit > 0 && totals.aiAuditCount >= auditThreshold;

    if (!nearAi && !nearAudit) return;

    const periodStart = startOfMonth(new Date());
    const existing = await this.prisma.notification.findFirst({
      where: { userId, type: "USAGE_ALERT", createdAt: { gte: periodStart } },
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
}
