import { Plan } from "@ogstack/shared";
import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { resolveApiKeyPlan, resolveUserPlan, tieredRateLimiter } from "./tiered-rate-limiter";

describe("tieredRateLimiter middleware", () => {
  let testCounter = 0;

  const createApp = (plan: Plan | undefined = Plan.FREE) => {
    const key = `test-key-${++testCounter}`;
    return new Elysia()
      .use(
        tieredRateLimiter({
          resolvePlan: () => plan,
          keyPrefix: `test-${testCounter}`,
          keyFn: () => key,
        }),
      )
      .get("/test", () => ({ ok: true }));
  };

  it("should allow requests within per-minute limit", async () => {
    const app = createApp(Plan.FREE); // 20/min
    const res = await app.handle(new Request("http://localhost/test"));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-ratelimit-limit")).toBe("20");
    expect(res.headers.get("x-ratelimit-remaining")).toBe("19");
  });

  it("should return 429 when per-minute limit exceeded", async () => {
    const app = createApp(Plan.FREE); // 20/min

    for (let i = 0; i < 20; i++) {
      await app.handle(new Request("http://localhost/test"));
    }

    const res = await app.handle(new Request("http://localhost/test"));
    expect(res.status).toBe(429);
    const body = (await res.json()) as { message: string };
    expect(body.message).toContain("Too many requests");
  });

  it("should use higher limits for PLUS plan", async () => {
    const app = createApp(Plan.PLUS); // 100/min
    const res = await app.handle(new Request("http://localhost/test"));
    expect(res.headers.get("x-ratelimit-limit")).toBe("100");
    expect(res.headers.get("x-ratelimit-remaining")).toBe("99");
  });

  it("should use highest limits for PRO plan", async () => {
    const app = createApp(Plan.PRO); // 500/min
    const res = await app.handle(new Request("http://localhost/test"));
    expect(res.headers.get("x-ratelimit-limit")).toBe("500");
  });

  it("should fall back to FREE plan when plan is undefined", async () => {
    const app = createApp(undefined);
    const res = await app.handle(new Request("http://localhost/test"));
    expect(res.headers.get("x-ratelimit-limit")).toBe("20");
  });

  it("should bypass rate limiting for social crawlers", async () => {
    const app = createApp(Plan.FREE);

    // Exhaust the limit
    for (let i = 0; i < 21; i++) {
      await app.handle(new Request("http://localhost/test"));
    }

    // Crawler should still get through
    const crawlerRes = await app.handle(
      new Request("http://localhost/test", {
        headers: { "user-agent": "Twitterbot/1.0" },
      }),
    );
    expect(crawlerRes.status).toBe(200);
  });

  it("should bypass for LinkedInBot", async () => {
    const app = createApp(Plan.FREE);
    for (let i = 0; i < 11; i++) {
      await app.handle(new Request("http://localhost/test"));
    }

    const res = await app.handle(
      new Request("http://localhost/test", {
        headers: { "user-agent": "LinkedInBot/1.0 (compatible; Mozilla/5.0)" },
      }),
    );
    expect(res.status).toBe(200);
  });

  it("should bypass for Slackbot", async () => {
    const app = createApp(Plan.FREE);
    for (let i = 0; i < 11; i++) {
      await app.handle(new Request("http://localhost/test"));
    }

    const res = await app.handle(
      new Request("http://localhost/test", {
        headers: { "user-agent": "Slackbot-LinkExpanding 1.0" },
      }),
    );
    expect(res.status).toBe(200);
  });

  it("should bypass for Discordbot", async () => {
    const app = createApp(Plan.FREE);
    for (let i = 0; i < 11; i++) {
      await app.handle(new Request("http://localhost/test"));
    }

    const res = await app.handle(
      new Request("http://localhost/test", {
        headers: { "user-agent": "Mozilla/5.0 (compatible; Discordbot/2.0)" },
      }),
    );
    expect(res.status).toBe(200);
  });

  it("should set x-ratelimit-reset header", async () => {
    const app = createApp(Plan.FREE);
    const res = await app.handle(new Request("http://localhost/test"));
    const reset = res.headers.get("x-ratelimit-reset");
    expect(reset).toBeDefined();
    expect(Number(reset)).toBeGreaterThan(0);
  });
});

describe("resolveUserPlan", () => {
  it("should extract plan from user context", () => {
    const ctx = { user: { plan: "PRO" } };
    expect(resolveUserPlan(ctx)).toBe("PRO");
  });

  it("should return undefined when no user context", () => {
    expect(resolveUserPlan({})).toBeUndefined();
  });
});

describe("resolveApiKeyPlan", () => {
  it("should extract plan from apiKeyContext", () => {
    const ctx = { apiKeyContext: { plan: "PLUS" } };
    expect(resolveApiKeyPlan(ctx)).toBe("PLUS");
  });

  it("should return undefined when no apiKeyContext", () => {
    expect(resolveApiKeyPlan({})).toBeUndefined();
  });
});
