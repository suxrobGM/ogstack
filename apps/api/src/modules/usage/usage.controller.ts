import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { UsageStatsQuerySchema, UsageStatsSchema } from "./usage.schema";
import { UsageService } from "./usage.service";

const usageService = container.resolve(UsageService);

export const usageController = new Elysia({ prefix: "/usage", tags: ["Usage"] })
  .use(authGuard)
  .get("/stats", ({ user, query }) => usageService.getUsageStats(user.id, query.period), {
    query: UsageStatsQuerySchema,
    response: UsageStatsSchema,
    detail: {
      summary: "Get usage statistics",
      description:
        "Get image generation usage statistics for a billing period. Defaults to the current month.",
    },
  });
