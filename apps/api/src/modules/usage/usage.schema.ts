import { t, type Static } from "elysia";

export const UsageStatsSchema = t.Object({
  period: t.String({ description: "Billing period in YYYY-MM format" }),
  plan: t.String(),
  used: t.Number({ description: "Non-AI images generated (unmetered; for display only)" }),
  aiImageCount: t.Number(),
  aiImageLimit: t.Number(),
  aiProImageCount: t.Number(),
  aiProImageLimit: t.Number({ description: "Sub-cap on Pro model; 0 means disabled" }),
  aiAuditCount: t.Number(),
  aiAuditLimit: t.Number(),
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
