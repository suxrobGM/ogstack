import "reflect-metadata";
import Stripe from "stripe";
import { container } from "tsyringe";
import { prisma } from "@/common/database";
import { PrismaClient } from "@/generated/prisma";

// Register the Prisma singleton so tsyringe resolves PrismaClient by class reference
container.registerInstance(PrismaClient, prisma);

// Register Stripe SDK if secret key is configured
if (process.env.STRIPE_SECRET_KEY) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  container.registerInstance(Stripe, stripe);
}

export { container };
