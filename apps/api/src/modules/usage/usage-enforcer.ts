import { Plan, PLAN_CONFIGS } from "@ogstack/shared";
import { PlanLimitError } from "@/common/errors/http.error";
import type { UsageTotals } from "./usage.repository";

/**
 * Pure decision logic: given a plan and current month's totals, decide whether
 * a new AI image generation is allowed. Throws PlanLimitError if not.
 */
export function assertAiImageAllowed(plan: Plan, totals: UsageTotals, useProModel: boolean): void {
  const config = PLAN_CONFIGS[plan];

  if (totals.aiImageCount >= config.aiImageLimit) {
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
      throw new PlanLimitError(`Monthly Flux 2 Pro quota of ${config.aiImageProLimit} exceeded.`);
    }
  }
}

/**
 * Pure decision logic: given a plan and current month's totals, decide whether
 * an AI audit recommendation is allowed. Throws PlanLimitError if not.
 */
export function assertAiAuditAllowed(plan: Plan, totals: UsageTotals): void {
  const config = PLAN_CONFIGS[plan];

  if (config.aiAuditLimit <= 0) {
    throw new PlanLimitError(
      "AI audit recommendations are not available on your plan. Upgrade to Plus or Pro.",
    );
  }

  if (totals.aiAuditCount >= config.aiAuditLimit) {
    throw new PlanLimitError(
      `Monthly AI audit quota of ${config.aiAuditLimit} exceeded. Upgrade your plan for more.`,
    );
  }
}
