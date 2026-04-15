import Stripe from "stripe";
import { singleton } from "tsyringe";

/**
 * Thin singleton wrapper around the Stripe SDK so services can inject it
 * instead of each constructing their own. Resolves STRIPE_SECRET_KEY lazily.
 */
@singleton()
export class StripeClient {
  readonly sdk: Stripe;

  constructor() {
    this.sdk = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
}

export const WEBSITE_URL = process.env.WEBSITE_URL ?? "http://localhost:4001";
