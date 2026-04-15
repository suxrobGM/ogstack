import { Elysia } from "elysia";
import { container } from "@/common/di";
import { BadRequestError } from "@/common/errors";
import { authGuard } from "@/common/middleware";
import { MessageResponseSchema } from "@/types/response";
import { BillingCheckoutService } from "./billing-checkout.service";
import { BillingLifecycleService } from "./billing-lifecycle.service";
import { BillingPlansService } from "./billing-plans.service";
import { BillingWebhookService } from "./billing-webhook.service";
import {
  CancelResponseSchema,
  CheckoutResponseSchema,
  CreateCheckoutBodySchema,
  DowngradeBodySchema,
  DowngradeResponseSchema,
  PlansResponseSchema,
  PortalResponseSchema,
  ResumeResponseSchema,
  SubscriptionNullableResponseSchema,
} from "./billing.schema";

const plansService = container.resolve(BillingPlansService);
const checkoutService = container.resolve(BillingCheckoutService);
const lifecycleService = container.resolve(BillingLifecycleService);
const webhookService = container.resolve(BillingWebhookService);

export const billingWebhookController = new Elysia({
  prefix: "/billing",
  tags: ["Billing"],
}).post(
  "/webhook",
  async ({ body, request }) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      throw new BadRequestError("Missing stripe-signature header");
    }

    await webhookService.handleEvent(body as string, signature);
    return { message: "Webhook processed" };
  },
  {
    parse: "text",
    response: MessageResponseSchema,
    detail: {
      summary: "Stripe webhook",
      description: "Handles incoming Stripe webhook events. No auth required.",
    },
  },
);

export const billingController = new Elysia({ prefix: "/billing", tags: ["Billing"] })
  .use(authGuard)
  .get("/plans", () => plansService.listPlans(), {
    response: PlansResponseSchema,
    detail: { summary: "List plans", description: "Returns all available pricing plans." },
  })
  .get("/subscription", ({ user }) => plansService.getSubscription(user.id), {
    response: SubscriptionNullableResponseSchema,
    detail: {
      summary: "Get subscription",
      description: "Returns the current user's subscription details.",
    },
  })
  .post(
    "/checkout",
    ({ user, body }) => checkoutService.createSession(user.id, body.priceId, body.promotionCode),
    {
      body: CreateCheckoutBodySchema,
      response: CheckoutResponseSchema,
      detail: {
        summary: "Create checkout session",
        description:
          "Creates a Stripe checkout session for subscribing to a plan. Supports promo codes pre-applied via `promotionCode` or entered on the Stripe-hosted page.",
      },
    },
  )
  .post("/downgrade", ({ user, body }) => lifecycleService.downgrade(user.id, body.targetPlan), {
    body: DowngradeBodySchema,
    response: DowngradeResponseSchema,
    detail: {
      summary: "Downgrade subscription",
      description:
        "Schedules a downgrade to a lower tier. Effective at the end of the current Stripe period; user retains current tier access until then.",
    },
  })
  .post("/portal", ({ user }) => lifecycleService.createPortalSession(user.id), {
    response: PortalResponseSchema,
    detail: {
      summary: "Create portal session",
      description: "Creates a Stripe billing portal session for managing payment methods.",
    },
  })
  .post("/cancel", ({ user }) => lifecycleService.cancel(user.id), {
    response: CancelResponseSchema,
    detail: {
      summary: "Cancel subscription",
      description: "Cancels the subscription at the end of the current billing period.",
    },
  })
  .post("/resume", ({ user }) => lifecycleService.resume(user.id), {
    response: ResumeResponseSchema,
    detail: {
      summary: "Resume subscription",
      description: "Resumes a subscription that was set to cancel at period end.",
    },
  });
