import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard, optionalAuthGuard, rateLimiter } from "@/common/middleware";
import { tieredRateLimiter } from "@/common/middleware/tiered-rate-limiter";
import { UuidIdParamSchema } from "@/types/request";
import {
  PageAuditCreateBodySchema,
  PageAuditHistoryQuerySchema,
  PageAuditHistoryResponseSchema,
  PageAuditReportSchema,
  PreviewUrlBodySchema,
  PreviewUrlResponseSchema,
} from "./page-audit.schema";
import { PageAuditService } from "./page-audit.service";

const pageAuditService = container.resolve(PageAuditService);

/**
 * /api/audit — public. Anonymous reports are stored with a null userId; when an
 * `access_token` cookie is present the report is attached to that user so it
 *  also shows up in dashboard history.
 */
export const pageAuditController = new Elysia({ prefix: "/audits", tags: ["Audits"] })
  .use(optionalAuthGuard)
  .use(rateLimiter({ max: 10, windowMs: 60_000 }))
  .post(
    "/",
    ({ body, user }) =>
      pageAuditService.create({
        url: body.url,
        userId: user?.id ?? null,
        includeAi: body.includeAi,
      }),
    {
      body: PageAuditCreateBodySchema,
      response: PageAuditReportSchema,
      detail: {
        summary: "Run an audit on a URL",
        description:
          "Scrapes a URL and returns a 0–100 score with categorized issues (OG, Twitter, SEO). Public endpoint — no auth required. When called with a session cookie, the report is attached to the user's dashboard history. Pass `includeAi: true` to run AI analysis (Plus/Pro plans).",
      },
    },
  )
  .get("/:id", ({ params }) => pageAuditService.getById(params.id), {
    params: UuidIdParamSchema,
    response: PageAuditReportSchema,
    detail: { summary: "Fetch a persisted audit report" },
  });

/** /api/audit — authenticated companion for dashboard history. */
export const pageAuditUserController = new Elysia({
  prefix: "/audits",
  tags: ["Audits"],
  detail: { security: [{ bearerAuth: [] }] },
})
  .use(authGuard)
  .use(tieredRateLimiter({ resolvePlan: "user", keyPrefix: "audit-user" }))
  .get("/history", ({ user, query }) => pageAuditService.listForUser(user.id, query), {
    query: PageAuditHistoryQuerySchema,
    response: PageAuditHistoryResponseSchema,
    detail: { summary: "List the current user's audit reports" },
  });

/**
 * /api/audits/preview - free social-preview tool. Auth-only but not plan-gated;
 * a flat per-user rate limit applies regardless of plan.
 */
export const socialPreviewController = new Elysia({
  prefix: "/audits",
  tags: ["Audits"],
  detail: { security: [{ bearerAuth: [] }] },
})
  .use(authGuard)
  .use(rateLimiter({ max: 10, windowMs: 60_000 }))
  .post("/preview", ({ body }) => pageAuditService.previewUrl(body.url), {
    body: PreviewUrlBodySchema,
    response: PreviewUrlResponseSchema,
    detail: {
      summary: "Scrape URL metadata for a social preview",
      description:
        "Returns OG/Twitter/favicon metadata for a URL without scoring or persistence. Powers the Social Preview tool. Auth required, free for all plans.",
    },
  });
