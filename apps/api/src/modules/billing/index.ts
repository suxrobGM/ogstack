import { container } from "@/common/di";
import { logger } from "@/common/logger";
import { BillingService } from "./billing.service";

export { billingController, billingWebhookController } from "./billing.controller";

export function syncStripeOnStartup(): void {
  if (!process.env.STRIPE_SECRET_KEY) {
    return;
  }

  container
    .resolve(BillingService)
    .syncStripeData()
    .catch((err) => {
      logger.error({ err }, "Failed to sync Stripe data on startup");
    });
}
