import Stripe from "stripe";
import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors";
import { logger } from "@/common/logger";
import { Plan, PrismaClient } from "@/generated/prisma";
import { NotificationService } from "@/modules/notification";
import { StripeClient } from "./stripe.client";

const SubscriptionStatus = {
  ACTIVE: "active",
  CANCELED: "canceled",
  PAST_DUE: "past_due",
  TRIALING: "trialing",
} as const;

function getItemPeriod(stripeSub: Stripe.Subscription) {
  const item = stripeSub.items.data[0];
  return {
    start: new Date((item?.current_period_start ?? 0) * 1000),
    end: new Date((item?.current_period_end ?? 0) * 1000),
  };
}

@singleton()
export class BillingWebhookService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly stripeClient: StripeClient,
    private readonly notificationService: NotificationService,
  ) {}

  async handleEvent(rawBody: string, signature: string): Promise<void> {
    const stripe = this.stripeClient.sdk;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new BadRequestError("Webhook secret not configured");
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    } catch (err) {
      logger.error({ err: (err as Error).message }, "Stripe signature verification failed");
      throw new BadRequestError("Invalid Stripe webhook signature");
    }

    logger.info({ type: event.type, eventId: event.id }, "Stripe webhook received");
    await this.dispatch(event, stripe);
  }

  private async dispatch(event: Stripe.Event, stripe: Stripe): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed":
        return this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe);
      case "customer.subscription.created":
      case "customer.subscription.updated":
        return this.syncSubscription(event.data.object as Stripe.Subscription);
      case "customer.subscription.deleted":
        return this.onSubscriptionDeleted(event.data.object as Stripe.Subscription);
      case "invoice.paid":
        return this.onInvoiceStatusChange(
          event.data.object as Stripe.Invoice,
          SubscriptionStatus.ACTIVE,
        );
      case "invoice.payment_failed":
        return this.onInvoiceStatusChange(
          event.data.object as Stripe.Invoice,
          SubscriptionStatus.PAST_DUE,
        );
      default:
        logger.debug({ type: event.type }, "Unhandled Stripe event type");
    }
  }

  private async onCheckoutCompleted(
    session: Stripe.Checkout.Session,
    stripe: Stripe,
  ): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) {
      logger.warn({ sessionId: session.id }, "Checkout session missing userId metadata");
      return;
    }

    if (session.mode !== "subscription" || !session.subscription) return;

    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription.id;

    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = stripeSub.items.data[0]?.price.id;
    if (!priceId) return;

    const plan = await this.prisma.pricingPlan.findUnique({
      where: { stripePriceId: priceId },
    });
    if (!plan) {
      logger.error({ priceId }, "No matching plan for Stripe price ID");
      return;
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    const period = getItemPeriod(stripeSub);

    await this.prisma.$transaction([
      this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planId: plan.id,
          stripeCustomerId: customerId ?? null,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          isComp: false,
        },
        update: {
          planId: plan.id,
          stripeCustomerId: customerId ?? null,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          cancelAtPeriodEnd: false,
          cancelAt: null,
          isComp: false,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { plan: plan.key as Plan },
      }),
    ]);

    logger.info({ userId, plan: plan.key }, "Checkout completed — plan activated");

    await this.notificationService.create({
      userId,
      type: "BILLING_EVENT",
      title: "Plan activated",
      message: `Your ${plan.name} plan is now active.`,
      actionUrl: "/billing",
    });
  }

  private async syncSubscription(stripeSub: Stripe.Subscription): Promise<void> {
    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (!sub) return;

    const priceId = stripeSub.items.data[0]?.price.id;
    const plan = priceId
      ? await this.prisma.pricingPlan.findUnique({ where: { stripePriceId: priceId } })
      : null;

    const status = this.mapStripeStatus(stripeSub.status);
    const period = getItemPeriod(stripeSub);

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status,
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        cancelAt: stripeSub.cancel_at ? new Date(stripeSub.cancel_at * 1000) : null,
        ...(plan && { planId: plan.id, stripePriceId: priceId }),
      },
    });

    if (plan) {
      await this.prisma.user.update({
        where: { id: sub.userId },
        data: { plan: plan.key as Plan },
      });
    }

    logger.info({ subscriptionId: stripeSub.id, status }, "Subscription synced");
  }

  private async onSubscriptionDeleted(stripeSub: Stripe.Subscription): Promise<void> {
    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (!sub) return;

    await this.prisma.$transaction([
      this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: SubscriptionStatus.CANCELED, cancelAtPeriodEnd: false },
      }),
      this.prisma.user.update({
        where: { id: sub.userId },
        data: { plan: Plan.FREE },
      }),
    ]);

    logger.info({ userId: sub.userId }, "Subscription deleted — reverted to FREE");

    await this.notificationService.create({
      userId: sub.userId,
      type: "BILLING_EVENT",
      title: "Subscription canceled",
      message: "Your subscription has been canceled. You are now on the Free plan.",
      actionUrl: "/billing",
    });
  }

  private async onInvoiceStatusChange(invoice: Stripe.Invoice, status: string): Promise<void> {
    const subscriptionId = invoice.parent?.subscription_details?.subscription as string | undefined;

    if (!subscriptionId) return;

    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });
    if (!sub) return;

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { status },
    });

    logger.info({ subscriptionId, status }, "Invoice status updated subscription");

    if (status === SubscriptionStatus.PAST_DUE) {
      await this.notificationService.create({
        userId: sub.userId,
        type: "BILLING_EVENT",
        title: "Payment failed",
        message: "Your recent payment failed. Please update your billing information.",
        actionUrl: "/billing",
      });
    }
  }

  private mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
    switch (stripeStatus) {
      case "active":
        return SubscriptionStatus.ACTIVE;
      case "past_due":
        return SubscriptionStatus.PAST_DUE;
      case "canceled":
        return SubscriptionStatus.CANCELED;
      case "trialing":
        return SubscriptionStatus.TRIALING;
      default:
        return stripeStatus;
    }
  }
}
