import { t, type Static } from "elysia";

export const USER_PROMPT_MAX_CHARS = 500;

export const AnalyzeRequestSchema = t.Object({
  url: t.String({ format: "uri" }),
  userPrompt: t.Optional(t.String({ maxLength: USER_PROMPT_MAX_CHARS })),
  fullOverride: t.Optional(t.Boolean()),
  skipAi: t.Optional(t.Boolean()),
});

const PageAnalysisImagePromptSchema = t.Object({
  headline: t.String(),
  tagline: t.Nullable(t.String()),
  backgroundKeywords: t.String(),
  suggestedAccent: t.String(),
  mood: t.Union([
    t.Literal("editorial"),
    t.Literal("playful"),
    t.Literal("technical"),
    t.Literal("corporate"),
    t.Literal("bold"),
  ]),
});

const PageAnalysisAiSchema = t.Object({
  title: t.String(),
  description: t.String(),
  summary: t.String(),
  keyPoints: t.Array(t.String()),
  topics: t.Array(t.String()),
  contentType: t.Union([
    t.Literal("article"),
    t.Literal("product"),
    t.Literal("docs"),
    t.Literal("landing"),
    t.Literal("profile"),
    t.Literal("other"),
  ]),
  language: t.String(),
  confidence: t.Union([t.Literal("high"), t.Literal("medium"), t.Literal("low")]),
  imagePrompt: PageAnalysisImagePromptSchema,
});

export const PageAnalysisMetadataSchema = t.Object({
  url: t.String(),
  title: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  image: t.Nullable(t.String()),
  siteName: t.Nullable(t.String()),
  favicon: t.Nullable(t.String()),
  author: t.Nullable(t.String()),
  canonicalUrl: t.Nullable(t.String()),
  lang: t.Nullable(t.String()),
  publishedTime: t.Nullable(t.String()),
  modifiedTime: t.Nullable(t.String()),
  tags: t.Array(t.String()),
  isThinHtml: t.Boolean(),
  renderedWithJs: t.Boolean(),
});

export const PageAnalysisResultSchema = t.Object({
  mode: t.Union([t.Literal("classic"), t.Literal("ai")]),
  metadata: PageAnalysisMetadataSchema,
  ai: t.Nullable(PageAnalysisAiSchema),
  cached: t.Boolean(),
});

export type AnalyzeRequest = Static<typeof AnalyzeRequestSchema>;
export type PageAnalysisMetadataDto = Static<typeof PageAnalysisMetadataSchema>;
export type PageAnalysisResultDto = Static<typeof PageAnalysisResultSchema>;
