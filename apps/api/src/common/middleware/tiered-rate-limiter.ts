import { Plan, PLAN_CONFIGS } from "@ogstack/shared";
import type { Server } from "bun";
import { Elysia } from "elysia";
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

type PlanResolver = (
  context: Record<string, unknown>,
) => Plan | undefined | Promise<Plan | undefined>;

interface TieredRateLimitOptions {
  resolvePlan: PlanResolver;
  keyPrefix: string;
  keyFn?: (
    context: Record<string, unknown>,
    request: Request,
    server: Server<unknown> | null,
  ) => string;
}

/**
 * Tiered rate limiter that enforces per-minute limits based on user plan.
 * Social crawler user agents bypass rate limits entirely.
 */
export function tieredRateLimiter(options: TieredRateLimitOptions) {
  const { resolvePlan, keyPrefix, keyFn } = options;

  return new Elysia({ name: `tiered-rate-limiter-${keyPrefix}` }).onBeforeHandle(
    { as: "scoped" },
    async (ctx) => {
      const { request, set, server } = ctx;

      if (isSocialCrawler(request)) {
        return;
      }

      const resolved = await resolvePlan(ctx as Record<string, unknown>);
      const plan = resolved ?? Plan.FREE;
      const config = PLAN_CONFIGS[plan];
      const { perMinute } = config.rateLimit;

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

/**
 * Resolves plan from JWT-authenticated user context.
 * Requires authGuard to be applied first.
 */
export const resolveUserPlan: PlanResolver = (ctx) => {
  const user = ctx.user as { plan?: Plan } | undefined;
  return user?.plan;
};

/**
 * Resolves plan from API key context.
 * Requires apiKeyGuard to be applied first.
 */
export const resolveApiKeyPlan: PlanResolver = (ctx) => {
  const apiKeyContext = ctx.apiKeyContext as { plan?: Plan } | undefined;
  return apiKeyContext?.plan;
};
