import { singleton } from "tsyringe";
import { PrismaClient } from "@/generated/prisma";
import type { PlanResponse, SubscriptionResponse } from "./billing.schema";

@singleton()
export class BillingPlansService {
  constructor(private readonly prisma: PrismaClient) {}

  async listPlans(): Promise<PlanResponse[]> {
    const plans = await this.prisma.pricingPlan.findMany({ orderBy: { sortOrder: "asc" } });
    return plans.map((p) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      price: Number(p.price),
      quota: p.quota,
      stripePriceId: p.stripePriceId,
      features: p.features,
      sortOrder: p.sortOrder,
    }));
  }

  async getSubscription(userId: string): Promise<SubscriptionResponse | null> {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    if (!sub) return null;

    return {
      id: sub.id,
      planId: sub.planId,
      planKey: sub.plan.key,
      planName: sub.plan.name,
      status: sub.status as SubscriptionResponse["status"],
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      cancelAt: sub.cancelAt,
      isComp: sub.isComp,
    };
  }
}
