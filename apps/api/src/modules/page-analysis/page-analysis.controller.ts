import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { tieredRateLimiter } from "@/common/middleware/tiered-rate-limiter";
import { AnalyzeRequestSchema, PageAnalysisResultSchema } from "./page-analysis.schema";
import { PageAnalysisService } from "./page-analysis.service";

const service = container.resolve(PageAnalysisService);

export const pageAnalysisController = new Elysia({
  prefix: "/page-analysis",
  tags: ["Page Analysis"],
  detail: { security: [{ bearerAuth: [] }] },
})
  .use(authGuard)
  .use(tieredRateLimiter({ resolvePlan: "user", keyPrefix: "page-analysis" }))
  .post(
    "/analyze",
    ({ body, user }) =>
      service.analyze({
        url: body.url,
        userPrompt: body.userPrompt,
        fullOverride: body.fullOverride ?? false,
        skipAi: body.skipAi ?? false,
        userId: user.id,
      }),
    {
      body: AnalyzeRequestSchema,
      response: PageAnalysisResultSchema,
      detail: {
        summary: "Analyze a URL (classic scrape for Free, AI-enhanced for Pro+)",
        description:
          "Scrapes a URL and returns page metadata plus (for Plus/Pro plans) AI-derived signals: summary, topics, inferred palette, suggested image prompt. Free tier falls back to classic (metadata-only) mode automatically.",
      },
    },
  );
