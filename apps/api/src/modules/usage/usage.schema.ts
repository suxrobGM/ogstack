import { t, type Static } from "elysia";

export const UsageStatsSchema = t.Object({
  period: t.String({ description: "Billing period in YYYY-MM format" }),
  plan: t.String(),
  quota: t.Number({ description: "Monthly image quota (-1 for unlimited)" }),
  used: t.Number({ description: "Images generated in the range" }),
  remaining: t.Number({ description: "Images remaining (-1 for unlimited)" }),
  aiImageCount: t.Number(),
  cacheHits: t.Number(),
});

export const UsageHistoryEntrySchema = t.Object({
  period: t.String({ description: "Billing period in YYYY-MM format" }),
  imageCount: t.Number(),
  aiImageCount: t.Number(),
  cacheHits: t.Number(),
});

export const UsageHistoryResponseSchema = t.Array(UsageHistoryEntrySchema);

export const UsageDailyEntrySchema = t.Object({
  date: t.Date({ description: "Start of the UTC day bucket" }),
  imageCount: t.Number(),
  aiImageCount: t.Number(),
});

export const UsageDailyResponseSchema = t.Array(UsageDailyEntrySchema);

export type UsageStats = Static<typeof UsageStatsSchema>;
export type UsageHistoryEntry = Static<typeof UsageHistoryEntrySchema>;
export type UsageDailyEntry = Static<typeof UsageDailyEntrySchema>;
