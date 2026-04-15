import { Plan, PLAN_CONFIGS } from "@ogstack/shared";
import type { Server } from "bun";
import { Elysia } from "elysia";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { getClientIp, RateLimitStore } from "./rate-limiter";

const CRAWLER_UA_PATTERNS = [
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "facebookexternalhit",
  "whatsapp",
  "telegrambot",
];

const ONE_MINUTE = 60_000;
const minuteStore = new RateLimitStore();

function isSocialCrawler(request: Request): boolean {
  const ua = request.headers.get("user-agent")?.toLowerCase();
  if (!ua) return false;
  return CRAWLER_UA_PATTERNS.some((pattern) => ua.includes(pattern));
}

export type PlanResolverKind = "user" | "apiKey" | "publicId";

type PlanResolver = (context: Record<string, unknown>) => Promise<Plan | null>;

const resolvers: Record<PlanResolverKind, PlanResolver> = {
  user: async (ctx) => {
    const user = ctx.user as { plan?: Plan } | null;
    return user?.plan ?? null;
  },
  apiKey: async (ctx) => {
    const apiKeyContext = ctx.apiKeyContext as { plan?: Plan } | null;
    return apiKeyContext?.plan ?? null;
  },
  publicId: async (ctx) => {
    const params = ctx.params as { publicId?: string } | null;
    if (!params?.publicId) {
      return null;
    }

    const prisma = container.resolve(PrismaClient);
    const project = await prisma.project.findUnique({
      where: { publicId: params.publicId },
      select: { user: { select: { plan: true } } },
    });
    return project?.user.plan ?? null;
  },
};

interface TieredRateLimitOptions {
  resolvePlan: PlanResolverKind;
  keyPrefix: string;
  keyFn?: (
    context: Record<string, unknown>,
    request: Request,
    server: Server<unknown> | null,
  ) => string;
}

/**
 * Tiered rate limiter that enforces per-minute limits based on user plan.
 * `resolvePlan` picks a built-in resolver:
 *  - "user": reads plan from `ctx.user` (requires authGuard upstream)
 *  - "apiKey": reads plan from `ctx.apiKeyContext` (requires apiKeyGuard)
 *  - "publicId": looks up plan via `ctx.params.publicId` → project owner
 *
 * Social crawler user agents bypass rate limits entirely.
 */
export function tieredRateLimiter(options: TieredRateLimitOptions) {
  const { resolvePlan, keyPrefix, keyFn } = options;
  const resolver = resolvers[resolvePlan];

  return new Elysia({ name: `tiered-rate-limiter-${keyPrefix}` }).onBeforeHandle(
    { as: "scoped" },
    async (ctx) => {
      const { request, set, server } = ctx;

      if (isSocialCrawler(request)) return;

      const plan = (await resolver(ctx as Record<string, unknown>)) ?? Plan.FREE;
      const { perMinute } = PLAN_CONFIGS[plan].rateLimit;

      const baseKey = keyFn
        ? keyFn(ctx as Record<string, unknown>, request, server)
        : getClientIp(request, server);

      const minuteKey = `${keyPrefix}:min:${baseKey}`;
      const minuteEntry = minuteStore.hit(minuteKey, ONE_MINUTE);

      set.headers["x-ratelimit-limit"] = String(perMinute);
      set.headers["x-ratelimit-remaining"] = String(Math.max(0, perMinute - minuteEntry.count));
      set.headers["x-ratelimit-reset"] = String(Math.ceil(minuteEntry.resetAt / 1000));

      if (minuteEntry.count > perMinute) {
        const retryAfter = Math.ceil((minuteEntry.resetAt - Date.now()) / 1000);
        set.headers["retry-after"] = String(retryAfter);
        set.status = 429;
        return { code: "RATE_LIMITED", message: "Too many requests, please try again later" };
      }
    },
  );
}
