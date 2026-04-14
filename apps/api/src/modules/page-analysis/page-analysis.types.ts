export type PageAnalysisMode = "classic" | "ai";
export type PageAnalysisConfidence = "high" | "medium" | "low";

export type PageAnalysisMood = "editorial" | "playful" | "technical" | "corporate" | "bold";

export type PageContentType = "article" | "product" | "docs" | "landing" | "profile" | "other";

export interface PageAnalysisImagePrompt {
  headline: string;
  tagline: string | null;
  backgroundKeywords: string;
  suggestedAccent: string;
  mood: PageAnalysisMood;
}

/** The AI-generated portion of a page analysis — structured insights plus
 *  image prompt seeds. Free-tier analyses omit this. */
export interface PageAnalysisAi {
  title: string;
  description: string;
  summary: string;
  keyPoints: string[];
  topics: string[];
  contentType: PageContentType;
  language: string;
  confidence: PageAnalysisConfidence;
  imagePrompt: PageAnalysisImagePrompt;
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
  mode: PageAnalysisMode;
  metadata: PageAnalysisMetadata;
  ai: PageAnalysisAi | null;
  cached: boolean;
  upgradeRequired?: boolean;
}
