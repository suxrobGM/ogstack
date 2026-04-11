import { PLAN_CONFIGS, PLANS } from "@ogstack/shared";
import Stripe from "stripe";
import { prisma } from "@/common/database";
import { logger } from "@/common/logger";

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ["5 templates", "GET meta tag mode", "Community support", "Watermark on images"],
  PRO: [
    "All templates",
    "Brand Kit",
    "AI backgrounds (Flux Schnell)",
    "No watermark",
    "Priority support",
  ],
  BUSINESS: [
    "Everything in Pro",
    "A/B testing",
    "Analytics dashboard",
    "AI backgrounds (Flux Pro)",
    "Team access",
  ],
  ENTERPRISE: [
    "Everything in Business",
    "Custom domain",
    "SLA guarantee",
    "SSO",
    "All AI models",
    "Dedicated support",
  ],
};

export async function seedPlans(): Promise<void> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeKey ? new Stripe(stripeKey) : null;

  for (const [index, key] of PLANS.entries()) {
    const config = PLAN_CONFIGS[key];
    let stripeProductId: string | null = null;
    let stripePriceId: string | null = null;

    if (stripe && config.price > 0) {
      const existingProducts = await stripe.products.search({
        query: `metadata["planKey"]:"${key}"`,
      });

      let product: Stripe.Product;
      const existingProduct = existingProducts.data[0];
      if (existingProduct) {
        product = existingProduct;
        logger.info("  Found existing Stripe product for %s", key);
      } else {
        product = await stripe.products.create({
          name: `OGStack ${config.name}`,
          metadata: { planKey: key },
        });
        logger.info("  Created Stripe product for %s", key);
      }
      stripeProductId = product.id;

      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        type: "recurring",
      });

      const matchingPrice = existingPrices.data.find(
        (p) => p.unit_amount === config.price * 100 && p.recurring?.interval === "month",
      );

      if (matchingPrice) {
        stripePriceId = matchingPrice.id;
        logger.info("  Found existing Stripe price for %s", key);
      } else {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: config.price * 100,
          currency: "usd",
          recurring: { interval: "month" },
          metadata: { planKey: key },
        });
        stripePriceId = price.id;
        logger.info("  Created Stripe price for %s", key);
      }
    }

    await prisma.pricingPlan.upsert({
      where: { key },
      create: {
        key,
        name: config.name,
        price: config.price,
        quota: config.quota,
        stripeProductId,
        stripePriceId,
        features: PLAN_FEATURES[key] ?? [],
        sortOrder: index,
      },
      update: {
        name: config.name,
        price: config.price,
        quota: config.quota,
        stripeProductId,
        stripePriceId,
        features: PLAN_FEATURES[key] ?? [],
        sortOrder: index,
      },
    });

    logger.info("  Upserted plan %s", key);
  }
}
