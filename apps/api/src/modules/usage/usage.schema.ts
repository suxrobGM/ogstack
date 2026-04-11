import { t, type Static } from "elysia";

export const UsageStatsSchema = t.Object({
  period: t.String({ description: "Billing period in YYYY-MM format" }),
  plan: t.String(),
  quota: t.Number({ description: "Monthly image quota (-1 for unlimited)" }),
  used: t.Number({ description: "Images generated this period" }),
  remaining: t.Number({ description: "Images remaining (-1 for unlimited)" }),
  aiImageCount: t.Number(),
  cacheHits: t.Number(),
});

export const UsageStatsQuerySchema = t.Object({
  period: t.Optional(
    t.String({
      pattern: "^\\d{4}-(0[1-9]|1[0-2])$",
      description: "Billing period in YYYY-MM format (defaults to current month)",
    }),
  ),
});

export type UsageStats = Static<typeof UsageStatsSchema>;
export type UsageStatsQuery = Static<typeof UsageStatsQuerySchema>;
