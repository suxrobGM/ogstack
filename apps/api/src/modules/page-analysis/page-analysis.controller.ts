import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { resolveUserPlan, tieredRateLimiter } from "@/common/middleware/tiered-rate-limiter";
import { Plan } from "@/generated/prisma";
import { AnalyzeRequestSchema, PageAnalysisResultSchema } from "./page-analysis.schema";
import { PageAnalysisService } from "./page-analysis.service";

const service = container.resolve(PageAnalysisService);

export const pageAnalysisController = new Elysia({
  prefix: "/page-analysis",
  tags: ["Page Analysis"],
})
  .use(authGuard)
  .use(tieredRateLimiter({ resolvePlan: resolveUserPlan, keyPrefix: "page-analysis" }))
  .post(
    "/analyze",
    ({ body, user }) =>
      service.analyze({
        url: body.url,
        userPrompt: body.userPrompt,
        fullOverride: body.fullOverride ?? false,
        userId: user.id,
        plan: user.plan as Plan,
      }),
    {
      body: AnalyzeRequestSchema,
      response: PageAnalysisResultSchema,
      detail: {
        summary: "Analyze a URL (classic scrape for Free, AI-enhanced for Pro+)",
      },
    },
  );
