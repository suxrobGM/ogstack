import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard, optionalAuthGuard, rateLimiter } from "@/common/middleware";
import { tieredRateLimiter } from "@/common/middleware/tiered-rate-limiter";
import { UuidIdParamSchema } from "@/types/request";
import {
  AuditCreateBodySchema,
  AuditHistoryQuerySchema,
  AuditHistoryResponseSchema,
  AuditReportSchema,
} from "./audit.schema";
import { AuditService } from "./audit.service";

const auditService = container.resolve(AuditService);

/** /api/audit — public. Anonymous reports are stored with a null userId; when an
 *  `access_token` cookie is present the report is attached to that user so it
 *  also shows up in dashboard history. */
export const auditController = new Elysia({ prefix: "/audit", tags: ["Audit"] })
  .use(optionalAuthGuard)
  .use(rateLimiter({ max: 10, windowMs: 60_000 }))
  .post(
    "/",
    ({ body, user }) =>
      auditService.create({
        url: body.url,
        userId: user?.id ?? null,
        includeAi: body.includeAi,
      }),
    {
      body: AuditCreateBodySchema,
      response: AuditReportSchema,
      detail: {
        summary: "Run an audit on a URL",
        description:
          "Scrapes a URL and returns a 0–100 score with categorized issues (OG, Twitter, SEO). Public endpoint — no auth required. When called with a session cookie, the report is attached to the user's dashboard history. Pass `includeAi: true` to run AI analysis (Plus/Pro plans).",
      },
    },
  )
  .get("/:id", ({ params }) => auditService.getById(params.id), {
    params: UuidIdParamSchema,
    response: AuditReportSchema,
    detail: { summary: "Fetch a persisted audit report" },
  });

/** /api/audit — authenticated companion for dashboard history. */
export const auditUserController = new Elysia({
  prefix: "/audit",
  tags: ["Audit"],
  detail: { security: [{ bearerAuth: [] }] },
})
  .use(authGuard)
  .use(tieredRateLimiter({ resolvePlan: "user", keyPrefix: "audit-user" }))
  .get("/history", ({ user, query }) => auditService.listForUser(user.id, query), {
    query: AuditHistoryQuerySchema,
    response: AuditHistoryResponseSchema,
    detail: { summary: "List the current user's audit reports" },
  });
