import { t, type Static } from "elysia";
import { AuditAiStatus } from "@/generated/prisma";
import { PaginationQueryBaseSchema } from "@/types/pagination";
import { PaginatedResponseSchema } from "@/types/response";

export const PageAuditPriorityActionSchema = t.Object({
  title: t.String(),
  rationale: t.String(),
  impact: t.Union([t.Literal("high"), t.Literal("medium"), t.Literal("low")]),
});

export const PageAuditSearchSnippetSchema = t.Object({
  suggestedTitle: t.String(),
  suggestedMetaDescription: t.String(),
});

export const PageAuditDiscoverabilitySchema = t.Object({
  schemaOrgRecommendations: t.Array(t.String()),
  canonicalHealth: t.Union([t.Literal("ok"), t.Literal("missing"), t.Literal("suspicious")]),
  hreflangRecommendations: t.Array(t.String()),
  structuredDataGaps: t.Array(t.String()),
});

export const PageAuditSuggestionPairSchema = t.Object({
  title: t.String(),
  description: t.String(),
});

export const PageAuditSuggestionsSchema = t.Object({
  og: PageAuditSuggestionPairSchema,
  twitter: PageAuditSuggestionPairSchema,
});

export const PageAuditAiInsightsSchema = t.Object({
  priorityActions: t.Array(PageAuditPriorityActionSchema),
  suggestions: PageAuditSuggestionsSchema,
  searchSnippet: PageAuditSearchSnippetSchema,
  toneAssessment: t.String(),
  audienceFit: t.Union([t.Literal("strong"), t.Literal("mixed"), t.Literal("weak")]),
  contentGaps: t.Array(t.String()),
  socialCtrTips: t.Array(t.String()),
  discoverability: PageAuditDiscoverabilitySchema,
  keywordOpportunities: t.Array(t.String()),
  severity: t.Union([t.Literal("low"), t.Literal("medium"), t.Literal("high")]),
  confidence: t.Union([t.Literal("high"), t.Literal("medium"), t.Literal("low")]),
});

export const PageAuditCreateBodySchema = t.Object({
  url: t.String({ format: "uri" }),
  includeAi: t.Optional(t.Boolean()),
});

export const PageAuditAiStatusSchema = t.Enum(AuditAiStatus);

export const PageAuditAiSchema = t.Object({
  status: PageAuditAiStatusSchema,
  analysis: t.Nullable(PageAuditAiInsightsSchema),
  error: t.Nullable(t.String()),
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

export const PageAuditIssueSchema = t.Object({
  id: t.String(),
  category: IssueCategorySchema,
  severity: IssueSeveritySchema,
  pass: t.Boolean(),
  title: t.String(),
  message: t.String(),
  fix: t.String(),
});

export const PageAuditPreviewMetadataSchema = t.Object({
  title: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  image: t.Nullable(t.String()),
  siteName: t.Nullable(t.String()),
  url: t.String(),
  favicon: t.Nullable(t.String()),
  twitterCardType: t.Nullable(t.String()),
});

export const PageAuditReportSchema = t.Object({
  id: t.String(),
  url: t.String(),
  overallScore: t.Number(),
  letterGrade: t.String(),
  createdAt: t.Date(),
  metadata: PageAuditPreviewMetadataSchema,
  issues: t.Array(PageAuditIssueSchema),
  categoryScores: t.Object({
    og: t.Number(),
    twitter: t.Number(),
    seo: t.Number(),
  }),
  ai: t.Nullable(PageAuditAiSchema),
});

export const PageAuditHistoryItemSchema = t.Object({
  id: t.String(),
  url: t.String(),
  overallScore: t.Number(),
  letterGrade: t.String(),
  createdAt: t.Date(),
});

export const PageAuditHistoryResponseSchema = PaginatedResponseSchema(PageAuditHistoryItemSchema);
export const PageAuditHistoryQuerySchema = PaginationQueryBaseSchema;

export type PageAuditCreateBody = Static<typeof PageAuditCreateBodySchema>;
export type PageAuditAi = Static<typeof PageAuditAiSchema>;
export type PageAuditAiInsights = Static<typeof PageAuditAiInsightsSchema>;
export type PageAuditPriorityAction = Static<typeof PageAuditPriorityActionSchema>;
export type PageAuditSearchSnippet = Static<typeof PageAuditSearchSnippetSchema>;
export type PageAuditSuggestions = Static<typeof PageAuditSuggestionsSchema>;
export type PageAuditDiscoverability = Static<typeof PageAuditDiscoverabilitySchema>;
export type PageAuditIssue = Static<typeof PageAuditIssueSchema>;
export type IssueSeverity = Static<typeof IssueSeveritySchema>;
export type IssueCategory = Static<typeof IssueCategorySchema>;
export type PageAuditPreviewMetadata = Static<typeof PageAuditPreviewMetadataSchema>;
export type PageAuditReport = Static<typeof PageAuditReportSchema>;
export type PageAuditHistoryItem = Static<typeof PageAuditHistoryItemSchema>;
export type PageAuditHistoryResponse = Static<typeof PageAuditHistoryResponseSchema>;
export type PageAuditHistoryQuery = Static<typeof PageAuditHistoryQuerySchema>;
