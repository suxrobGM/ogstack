import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import { Plan, PrismaClient } from "@/generated/prisma";
import { StripeClient } from "./stripe.client";

@singleton()
export class BillingSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly stripe: StripeClient,
  ) {}

  /** Mirror live Stripe subscriptions into the local Subscription table on startup. */
  async syncStripeData(): Promise<void> {
    let synced = 0;

    const stripeSubList = this.stripe.sdk.subscriptions.list({ status: "all" });

    for await (const stripeSub of stripeSubList) {
      const customerId =
        typeof stripeSub.customer === "string" ? stripeSub.customer : stripeSub.customer.id;

      const customer = await this.stripe.sdk.customers.retrieve(customerId);
      if (customer.deleted) continue;

      const userId = customer.metadata?.userId;
      if (!userId) continue;

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) continue;

      const priceId = stripeSub.items.data[0]?.price.id;
      if (!priceId) continue;

      const plan = await this.prisma.pricingPlan.findUnique({
        where: { stripePriceId: priceId },
      });
      if (!plan) continue;

      const item = stripeSub.items.data[0];
      const periodStart = new Date((item?.current_period_start ?? 0) * 1000);
      const periodEnd = new Date((item?.current_period_end ?? 0) * 1000);

      await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planId: plan.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: priceId,
          status: stripeSub.status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          cancelAt: stripeSub.cancel_at ? new Date(stripeSub.cancel_at * 1000) : null,
          isComp: false,
        },
        update: {
          planId: plan.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: priceId,
          status: stripeSub.status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          cancelAt: stripeSub.cancel_at ? new Date(stripeSub.cancel_at * 1000) : null,
          isComp: false,
        },
      });

      if (stripeSub.status === "active" || stripeSub.status === "trialing") {
        await this.prisma.user.update({
          where: { id: userId },
          data: { plan: plan.key as Plan },
        });
      }

      synced++;
    }

    logger.info("Synced %d Stripe subscriptions with database", synced);
  }
}
