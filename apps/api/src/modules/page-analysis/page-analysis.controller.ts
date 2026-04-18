import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { tieredRateLimiter } from "@/common/middleware/tiered-rate-limiter";
import { AnalyzeRequestSchema, PageAnalysisResultSchema } from "./page-analysis.schema";
import { PageAnalysisService } from "./page-analysis.service";

const service = container.resolve(PageAnalysisService);

export const pageAnalysisController = new Elysia({
  prefix: "/analyses",
  tags: ["Analyses"],
  detail: { security: [{ bearerAuth: [] }] },
})
  .use(authGuard)
  .use(tieredRateLimiter({ resolvePlan: "user", keyPrefix: "page-analysis" }))
  .post(
    "/",
    ({ body, user }) => {
      const mode = body.mode ?? "ai";
      return service.analyze({
        url: body.url,
        userPrompt: body.customPrompt,
        fullOverride: mode === "override",
        skipAi: mode === "classic",
        userId: user.id,
      });
    },
    {
      body: AnalyzeRequestSchema,
      response: PageAnalysisResultSchema,
      detail: {
        summary: "Analyze a URL (classic scrape for Free, AI-enhanced for Pro+)",
        description:
          'Scrapes a URL and returns page metadata plus (for Plus/Pro plans) AI-derived signals: summary, topics, inferred palette, suggested image prompt. Pass `mode: "classic"` to skip AI, `mode: "override"` when the caller supplies its own prompt, or omit (defaults to `ai`). Free tier falls back to classic automatically.',
      },
    },
  );
