import { singleton } from "tsyringe";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { PrismaClient } from "@/generated/prisma";
import type { CheckoutResponse } from "./billing.schema";
import { StripeClient, WEBSITE_URL } from "./stripe.client";

@singleton()
export class BillingCheckoutService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly stripe: StripeClient,
  ) {}

  /**
   * Creates a Stripe checkout session for a new subscription, or updates the
   * existing subscription item in place for an upgrade/downgrade between paid
   * tiers. Pass `promotionCode` to pre-apply a discount; otherwise the hosted
   * checkout renders the promo code input.
   */
  async createSession(
    userId: string,
    priceId: string,
    promotionCode?: string,
  ): Promise<CheckoutResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) throw new NotFoundError("User not found");

    const plan = await this.prisma.pricingPlan.findUnique({
      where: { stripePriceId: priceId },
    });
    if (!plan) throw new BadRequestError("Invalid price ID");

    const customerId = await this.ensureCustomer(user);

    if (user.subscription?.stripeSubscriptionId && !user.subscription.isComp) {
      return this.changeSubscriptionPrice(
        user.subscription.stripeSubscriptionId,
        priceId,
        customerId,
      );
    }

    const session = await this.stripe.sdk.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(promotionCode
        ? { discounts: await this.resolvePromotionCode(promotionCode) }
        : { allow_promotion_codes: true }),
      success_url: `${WEBSITE_URL}/billing?success=true`,
      cancel_url: `${WEBSITE_URL}/billing?canceled=true`,
      metadata: { userId: user.id },
    });

    return { sessionId: session.id, url: session.url! };
  }

  private async ensureCustomer(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    subscription: { stripeCustomerId: string | null } | null;
  }): Promise<string> {
    if (user.subscription?.stripeCustomerId) return user.subscription.stripeCustomerId;

    const customer = await this.stripe.sdk.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      metadata: { userId: user.id },
    });
    return customer.id;
  }

  private async changeSubscriptionPrice(
    stripeSubscriptionId: string,
    newPriceId: string,
    customerId: string,
  ): Promise<CheckoutResponse> {
    const stripeSub = await this.stripe.sdk.subscriptions.retrieve(stripeSubscriptionId);
    const firstItem = stripeSub.items.data[0];
    if (!firstItem) {
      throw new BadRequestError("Cannot modify subscription — no items found");
    }

    const currentPriceId = firstItem.price.id;
    const [currentPlan, targetPlan] = await Promise.all([
      this.prisma.pricingPlan.findUnique({ where: { stripePriceId: currentPriceId } }),
      this.prisma.pricingPlan.findUnique({ where: { stripePriceId: newPriceId } }),
    ]);
    if (!targetPlan) {
      throw new BadRequestError("Invalid target price ID");
    }

    const isUpgrade = (targetPlan.sortOrder ?? 0) > (currentPlan?.sortOrder ?? 0);

    await this.stripe.sdk.subscriptions.update(stripeSubscriptionId, {
      items: [{ id: firstItem.id, price: newPriceId }],
      proration_behavior: isUpgrade ? "create_prorations" : "none",
      cancel_at_period_end: false,
    });

    const session = await this.stripe.sdk.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${WEBSITE_URL}/billing?success=true`,
    });

    return { sessionId: stripeSubscriptionId, url: session.url };
  }

  private async resolvePromotionCode(code: string): Promise<{ promotion_code: string }[]> {
    const promo = await this.stripe.sdk.promotionCodes.list({ code, active: true, limit: 1 });
    const found = promo.data[0];
    if (!found) throw new BadRequestError("Promotion code is invalid or inactive");
    return [{ promotion_code: found.id }];
  }
}
