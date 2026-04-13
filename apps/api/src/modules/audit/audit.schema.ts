import { t, type Static } from "elysia";
import { PaginationQueryBaseSchema } from "@/types/pagination";
import { PaginatedResponseSchema } from "@/types/response";

export const AuditCreateBodySchema = t.Object({
  url: t.String({ format: "uri" }),
});

export const IssueSeveritySchema = t.Union([
  t.Literal("critical"),
  t.Literal("warning"),
  t.Literal("info"),
]);

export const IssueCategorySchema = t.Union([
  t.Literal("og"),
  t.Literal("twitter"),
  t.Literal("seo"),
]);

export const AuditIssueSchema = t.Object({
  id: t.String(),
  category: IssueCategorySchema,
  severity: IssueSeveritySchema,
  pass: t.Boolean(),
  title: t.String(),
  message: t.String(),
  fix: t.String(),
});

export const AuditPreviewMetadataSchema = t.Object({
  title: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  image: t.Nullable(t.String()),
  siteName: t.Nullable(t.String()),
  url: t.String(),
  favicon: t.Nullable(t.String()),
  twitterCardType: t.Nullable(t.String()),
});

export const AuditReportSchema = t.Object({
  id: t.String(),
  url: t.String(),
  overallScore: t.Number(),
  letterGrade: t.String(),
  createdAt: t.Date(),
  metadata: AuditPreviewMetadataSchema,
  issues: t.Array(AuditIssueSchema),
  categoryScores: t.Object({
    og: t.Number(),
    twitter: t.Number(),
    seo: t.Number(),
  }),
});

export const AuditHistoryItemSchema = t.Object({
  id: t.String(),
  url: t.String(),
  overallScore: t.Number(),
  letterGrade: t.String(),
  createdAt: t.Date(),
});

export const AuditHistoryResponseSchema = PaginatedResponseSchema(AuditHistoryItemSchema);

export const AuditHistoryQuerySchema = PaginationQueryBaseSchema;

export type AuditCreateBody = Static<typeof AuditCreateBodySchema>;
export type AuditIssue = Static<typeof AuditIssueSchema>;
export type IssueSeverity = Static<typeof IssueSeveritySchema>;
export type IssueCategory = Static<typeof IssueCategorySchema>;
export type AuditPreviewMetadata = Static<typeof AuditPreviewMetadataSchema>;
export type AuditReport = Static<typeof AuditReportSchema>;
export type AuditHistoryItem = Static<typeof AuditHistoryItemSchema>;
export type AuditHistoryResponse = Static<typeof AuditHistoryResponseSchema>;
export type AuditHistoryQuery = Static<typeof AuditHistoryQuerySchema>;
