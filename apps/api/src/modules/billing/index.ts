import { container } from "@/common/di";
import { logger } from "@/common/logger";
import { BillingSyncService } from "./billing-sync.service";

export * from "./billing.controller";

export function syncStripeOnStartup(): void {
  if (!process.env.STRIPE_SECRET_KEY) {
    return;
  }

  container
    .resolve(BillingSyncService)
    .syncStripeData()
    .catch((err) => {
      logger.error({ err }, "Failed to sync Stripe data on startup");
    });
}
