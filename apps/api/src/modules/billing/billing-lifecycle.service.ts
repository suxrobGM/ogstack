import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors";
import { PrismaClient } from "@/generated/prisma";
import type {
  CancelResponse,
  DowngradeResponse,
  PortalResponse,
  ResumeResponse,
} from "./billing.schema";
import { StripeClient, WEBSITE_URL } from "./stripe.client";

@singleton()
export class BillingLifecycleService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly stripe: StripeClient,
  ) {}

  async createPortalSession(userId: string): Promise<PortalResponse> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestError("No billing account found. Subscribe to a plan first.");
    }

    const session = await this.stripe.sdk.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${WEBSITE_URL}/billing`,
    });
    return { url: session.url };
  }

  async cancel(userId: string): Promise<CancelResponse> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeSubscriptionId) {
      throw new BadRequestError("No active subscription to cancel");
    }
    if (sub.isComp) {
      throw new BadRequestError("Complimentary subscriptions cannot be canceled");
    }

    const updated = await this.stripe.sdk.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    const periodEnd = updated.items.data[0]?.current_period_end;

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true },
    });

    return {
      id: sub.id,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : sub.currentPeriodEnd,
    };
  }

  async resume(userId: string): Promise<ResumeResponse> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeSubscriptionId) {
      throw new BadRequestError("No subscription to resume");
    }
    if (!sub.cancelAtPeriodEnd) {
      throw new BadRequestError("Subscription is not set to cancel");
    }

    await this.stripe.sdk.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: false, cancelAt: null },
    });

    return { id: sub.id, cancelAtPeriodEnd: false };
  }

  /**
   * End-of-period downgrade. For FREE we use `cancel_at_period_end`. For PLUS
   * we create a Stripe subscription schedule that swaps price at the current
   * period boundary. User retains current tier access until then.
   */
  async downgrade(userId: string, targetPlan: "FREE" | "PLUS"): Promise<DowngradeResponse> {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    if (!sub?.stripeSubscriptionId) {
      throw new BadRequestError("No active subscription to downgrade");
    }
    if (sub.isComp) {
      throw new BadRequestError("Complimentary subscriptions cannot be downgraded");
    }

    const targetSortOrder = targetPlan === "FREE" ? 0 : 1;
    if (targetSortOrder >= sub.plan.sortOrder) {
      throw new BadRequestError("Target plan is not lower than current plan");
    }

    if (targetPlan === "FREE") {
      return this.scheduleCancelAtPeriodEnd(sub);
    }
    return this.schedulePriceSwap(sub.stripeSubscriptionId, sub.id);
  }

  private async scheduleCancelAtPeriodEnd(sub: {
    id: string;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: Date;
  }): Promise<DowngradeResponse> {
    const updated = await this.stripe.sdk.subscriptions.update(sub.stripeSubscriptionId!, {
      cancel_at_period_end: true,
    });
    const periodEnd = updated.items.data[0]?.current_period_end;
    const effectiveAt = periodEnd ? new Date(periodEnd * 1000) : sub.currentPeriodEnd;

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true, cancelAt: effectiveAt },
    });

    return { id: sub.id, targetPlan: "FREE", effectiveAt };
  }

  private async schedulePriceSwap(
    stripeSubscriptionId: string,
    subId: string,
  ): Promise<DowngradeResponse> {
    const targetDbPlan = await this.prisma.pricingPlan.findUnique({ where: { key: "PLUS" } });
    if (!targetDbPlan?.stripePriceId) {
      throw new BadRequestError("PLUS plan not configured in Stripe");
    }

    const stripeSub = await this.stripe.sdk.subscriptions.retrieve(stripeSubscriptionId);
    const firstItem = stripeSub.items.data[0];
    if (!firstItem) {
      throw new BadRequestError("Subscription has no items");
    }

    const periodStart = firstItem.current_period_start;
    const periodEnd = firstItem.current_period_end;

    const schedule = await this.stripe.sdk.subscriptionSchedules.create({
      from_subscription: stripeSubscriptionId,
    });

    await this.stripe.sdk.subscriptionSchedules.update(schedule.id, {
      phases: [
        {
          items: [{ price: firstItem.price.id, quantity: 1 }],
          start_date: periodStart,
          end_date: periodEnd,
          proration_behavior: "none",
        },
        {
          items: [{ price: targetDbPlan.stripePriceId, quantity: 1 }],
          proration_behavior: "none",
        },
      ],
      end_behavior: "release",
    });

    return { id: subId, targetPlan: "PLUS", effectiveAt: new Date(periodEnd * 1000) };
  }
}
