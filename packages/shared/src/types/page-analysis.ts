export const ANALYZE_MODES = ["classic", "ai", "override"] as const;
export type AnalyzeMode = (typeof ANALYZE_MODES)[number];

export const PAGE_ANALYSIS_CONFIDENCES = ["high", "medium", "low"] as const;
export type PageAnalysisConfidence = (typeof PAGE_ANALYSIS_CONFIDENCES)[number];

export const PAGE_ANALYSIS_MOODS = [
  "editorial",
  "playful",
  "technical",
  "corporate",
  "bold",
] as const;
export type PageAnalysisMood = (typeof PAGE_ANALYSIS_MOODS)[number];

export const PAGE_CONTENT_TYPES = [
  "article",
  "product",
  "docs",
  "landing",
  "profile",
  "other",
] as const;
export type PageContentType = (typeof PAGE_CONTENT_TYPES)[number];

export const PAGE_THEMES = [
  "editorial",
  "technical",
  "minimal",
  "vibrant",
  "muted",
  "playful",
  "corporate",
  "dark",
  "luxury",
] as const;
export type PageTheme = (typeof PAGE_THEMES)[number];

export const PAGE_AUTHORITIES = ["high", "medium", "low", "unknown"] as const;
export type PageAuthority = (typeof PAGE_AUTHORITIES)[number];

export interface PageAnalysisImagePrompt {
  headline: string;
  tagline: string | null;
  backgroundKeywords: string;
  suggestedAccent: string;
  mood: PageAnalysisMood;
}

/**
 * Per-asset FLUX prompts authored by the LLM during page analysis. The
 * pipeline uses these verbatim (plus a deterministic size/palette tail) when
 * present, and falls back to template builders when absent.
 */
export interface PageAnalysisImagePrompts {
  og: string;
  hero: string;
  icon: string;
}

export interface BrandHints {
  inferredName: string | null;
  palette: string[];
  industry: string | null;
}

export interface ContentSignals {
  structuredDataTypes: string[];
  hasAuthor: boolean;
  hasPublishedDate: boolean;
  freshnessDays: number | null;
  authority: PageAuthority;
}

export interface TopicWeight {
  topic: string;
  weight: number;
}

export interface PageAnalysisAi {
  title: string;
  description: string;
  summary: string;
  keyPoints: string[];
  topics: TopicWeight[];
  contentType: PageContentType;
  language: string;
  confidence: PageAnalysisConfidence;
  pageTheme: PageTheme;
  brandHints: BrandHints;
  contentSignals: ContentSignals;
  imagePrompt: PageAnalysisImagePrompt;
  imagePrompts?: PageAnalysisImagePrompts;
}

export interface PageAnalysisMetadata {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
  author: string | null;
  canonicalUrl: string | null;
  lang: string | null;
  publishedTime: string | null;
  modifiedTime: string | null;
  tags: string[];
  isThinHtml: boolean;
  renderedWithJs: boolean;
}

export interface PageAnalysisResult {
  metadata: PageAnalysisMetadata;
  ai: PageAnalysisAi | null;
  cached: boolean;
}
