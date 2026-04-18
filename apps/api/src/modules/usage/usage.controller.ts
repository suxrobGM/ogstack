import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { DateRangeQuerySchema } from "@/types/pagination";
import {
  UsageDailyResponseSchema,
  UsageHistoryResponseSchema,
  UsageStatsSchema,
} from "./usage.schema";
import { UsageService } from "./usage.service";

const usageService = container.resolve(UsageService);

export const usageController = new Elysia({
  prefix: "/usage",
  tags: ["Usage"],
  detail: { security: [{ bearerAuth: [] }] },
})
  .use(authGuard)
  .get("/stats", ({ user, query }) => usageService.getUsageStats(user.id, query), {
    query: DateRangeQuerySchema,
    response: UsageStatsSchema,
    detail: {
      summary: "Get usage statistics",
      description:
        "Image generation usage for a date range. Defaults to the current month when no range is supplied.",
    },
  })
  .get("/history", ({ user, query }) => usageService.getUsageHistory(user.id, query), {
    query: DateRangeQuerySchema,
    response: UsageHistoryResponseSchema,
    detail: {
      summary: "Get monthly usage history",
      description:
        "Monthly image counts for the requested date range (defaults to last 6 months). Zero-filled for gap months.",
    },
  })
  .get("/daily", ({ user, query }) => usageService.getDailyUsage(user.id, query), {
    query: DateRangeQuerySchema,
    response: UsageDailyResponseSchema,
    detail: {
      summary: "Get daily usage",
      description:
        "Daily image counts for the requested date range (defaults to last 30 days), aggregated from generated images.",
    },
  });
