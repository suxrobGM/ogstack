import { Plan, PLAN_CONFIGS, PLANS } from "@ogstack/shared";
import Stripe from "stripe";
import { prisma } from "@/common/database";
import { logger } from "@/common/logger";

const PLAN_FEATURES: Record<Plan, string[]> = {
  FREE: [
    "Unlimited non-AI images",
    "3 AI images / month (standard model)",
    "All templates",
    "1 project, 1 domain",
    "AI page analysis",
    "20 requests / minute",
    "Watermark on images",
  ],
  PLUS: [
    "Everything in Free",
    "100 AI images / month (standard model)",
    "100 AI audit recommendations / month",
    "5 projects, 3 domains per project",
    "100 requests / minute",
    "Email support",
  ],
  PRO: [
    "Everything in Plus",
    "1,000 AI images / month (300 Pro + 700 standard)",
    "1,000 AI audit recommendations / month",
    "Unlimited projects and domains",
    "No watermark",
    "500 requests / minute",
    "Priority support",
  ],
};

export async function seedPlans(): Promise<void> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeKey ? new Stripe(stripeKey) : null;

  for (const key of PLANS) {
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
        quota: config.aiImageLimit,
        stripeProductId,
        stripePriceId,
        features: PLAN_FEATURES[key] ?? [],
        sortOrder: config.sortOrder,
      },
      update: {
        name: config.name,
        price: config.price,
        quota: config.aiImageLimit,
        stripeProductId,
        stripePriceId,
        features: PLAN_FEATURES[key] ?? [],
        sortOrder: config.sortOrder,
      },
    });

    logger.info("  Upserted plan %s", key);
  }
}
