import Stripe from "stripe";
import { injectable } from "tsyringe";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { PrismaClient } from "@/generated/prisma";
import type {
  CancelResponse,
  CheckoutResponse,
  PlanResponse,
  PortalResponse,
  ResumeResponse,
  SubscriptionResponse,
} from "./billing.schema";

const WEBSITE_URL = process.env.WEBSITE_URL ?? "http://localhost:4001";

@injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly stripe: Stripe,
  ) {}

  getStripe(): Stripe {
    return this.stripe;
  }

  async getPlans(): Promise<PlanResponse[]> {
    const plans = await this.prisma.pricingPlan.findMany({
      orderBy: { sortOrder: "asc" },
    });

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
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      cancelAt: sub.cancelAt,
      isComp: sub.isComp,
    };
  }

  async createCheckoutSession(userId: string, priceId: string): Promise<CheckoutResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) throw new NotFoundError("User not found");

    const plan = await this.prisma.pricingPlan.findUnique({
      where: { stripePriceId: priceId },
    });
    if (!plan) throw new BadRequestError("Invalid price ID");

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }

    if (user.subscription?.stripeSubscriptionId && !user.subscription.isComp) {
      return this.upgradeSubscription(user.subscription.stripeSubscriptionId, priceId, customerId);
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${WEBSITE_URL}/settings/billing?success=true`,
      cancel_url: `${WEBSITE_URL}/settings/billing?canceled=true`,
      metadata: { userId: user.id },
    });

    return { sessionId: session.id, url: session.url! };
  }

  async createPortalSession(userId: string): Promise<PortalResponse> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestError("No billing account found. Subscribe to a plan first.");
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${WEBSITE_URL}/settings/billing`,
    });

    return { url: session.url };
  }

  async cancelSubscription(userId: string): Promise<CancelResponse> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeSubscriptionId) {
      throw new BadRequestError("No active subscription to cancel");
    }
    if (sub.isComp) {
      throw new BadRequestError("Complimentary subscriptions cannot be canceled");
    }

    const updated = await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
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

  async resumeSubscription(userId: string): Promise<ResumeResponse> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeSubscriptionId) {
      throw new BadRequestError("No subscription to resume");
    }
    if (!sub.cancelAtPeriodEnd) {
      throw new BadRequestError("Subscription is not set to cancel");
    }

    await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: false, cancelAt: null },
    });

    return { id: sub.id, cancelAtPeriodEnd: false };
  }

  private async upgradeSubscription(
    stripeSubscriptionId: string,
    newPriceId: string,
    customerId: string,
  ): Promise<CheckoutResponse> {
    const stripeSub = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
    const firstItem = stripeSub.items.data[0];
    if (!firstItem) throw new BadRequestError("Cannot modify subscription — no items found");

    const currentPriceId = firstItem.price.id;
    const [currentPlan, targetPlan] = await Promise.all([
      this.prisma.pricingPlan.findUnique({ where: { stripePriceId: currentPriceId } }),
      this.prisma.pricingPlan.findUnique({ where: { stripePriceId: newPriceId } }),
    ]);

    if (!targetPlan) throw new BadRequestError("Invalid target price ID");

    const isUpgrade = (targetPlan.sortOrder ?? 0) > (currentPlan?.sortOrder ?? 0);

    await this.stripe.subscriptions.update(stripeSubscriptionId, {
      items: [{ id: firstItem.id, price: newPriceId }],
      proration_behavior: isUpgrade ? "create_prorations" : "none",
      cancel_at_period_end: false,
    });

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${WEBSITE_URL}/settings/billing?success=true`,
    });

    return { sessionId: stripeSubscriptionId, url: session.url };
  }
}
