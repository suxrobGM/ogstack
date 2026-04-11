import { t, type Static } from "elysia";

// ── Request schemas ──

export const CreateCheckoutBodySchema = t.Object({
  priceId: t.String({ description: "Stripe price ID of the plan to subscribe to" }),
});

// ── Response schemas ──

export const StripeSubscriptionStatus = t.Union([
  t.Literal("active"),
  t.Literal("trialing"),
  t.Literal("past_due"),
  t.Literal("canceled"),
  t.Literal("unpaid"),
  t.Literal("incomplete"),
  t.Literal("incomplete_expired"),
  t.Literal("paused"),
]);

export const CheckoutResponseSchema = t.Object({
  sessionId: t.String(),
  url: t.String(),
});

export const PortalResponseSchema = t.Object({
  url: t.String(),
});

export const PlanSchema = t.Object({
  id: t.String(),
  key: t.String(),
  name: t.String(),
  price: t.Number(),
  quota: t.Number(),
  stripePriceId: t.Nullable(t.String()),
  features: t.Array(t.String()),
  sortOrder: t.Number(),
});

export const PlansResponseSchema = t.Array(PlanSchema);

export const SubscriptionResponseSchema = t.Object({
  id: t.String(),
  planId: t.String(),
  planKey: t.String(),
  planName: t.String(),
  status: StripeSubscriptionStatus,
  currentPeriodStart: t.Date(),
  currentPeriodEnd: t.Date(),
  cancelAtPeriodEnd: t.Boolean(),
  cancelAt: t.Nullable(t.Date()),
  isComp: t.Boolean(),
});

export const SubscriptionNullableResponseSchema = t.Nullable(SubscriptionResponseSchema);

export const CancelResponseSchema = t.Object({
  id: t.String(),
  cancelAtPeriodEnd: t.Boolean(),
  currentPeriodEnd: t.Date(),
});

export const ResumeResponseSchema = t.Object({
  id: t.String(),
  cancelAtPeriodEnd: t.Boolean(),
});

// ── Type aliases ──

export type CreateCheckoutBody = Static<typeof CreateCheckoutBodySchema>;
export type CheckoutResponse = Static<typeof CheckoutResponseSchema>;
export type PortalResponse = Static<typeof PortalResponseSchema>;
export type PlanResponse = Static<typeof PlanSchema>;
export type SubscriptionResponse = Static<typeof SubscriptionResponseSchema>;
export type CancelResponse = Static<typeof CancelResponseSchema>;
export type ResumeResponse = Static<typeof ResumeResponseSchema>;
