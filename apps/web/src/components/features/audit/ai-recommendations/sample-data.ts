import type { AuditReportResponse } from "@/types/api";

export type AiInsights = NonNullable<AuditReportResponse["aiAnalysis"]>;

export const SAMPLE_INSIGHTS: AiInsights = {
  priorityActions: [
    {
      title: "Rewrite og:title to lead with the measured outcome",
      rationale:
        "Current title is generic; a specific number in the first 40 chars lifts social CTR for a technical audience.",
      impact: "high",
    },
    {
      title: "Add Article + author JSON-LD",
      rationale:
        "Google shows author byline and date in rich results when Article + Person schema are present.",
      impact: "medium",
    },
    {
      title: "Add alt text to the three hero diagrams",
      rationale: "Accessibility + image search pick up diagram captions as queryable content.",
      impact: "medium",
    },
  ],
  suggestedOgTitle: "Cut LCP to under 1s on Next.js — measured",
  suggestedOgDescription:
    "How we shaved 2.3s off Largest Contentful Paint by fixing the image pipeline, moving landing to ISR, and serving OG previews from the edge.",
  suggestedTwitterTitle: "We got LCP under 1s on Next.js. Here's the before/after.",
  suggestedTwitterDescription:
    "A concrete performance overhaul: image pipeline, edge-cached OG previews, ISR landing. Real Speed Insights numbers, not synthetic.",
  searchSnippet: {
    suggestedTitle: "Next.js LCP optimization: under 1s with ISR + edge OG",
    suggestedMetaDescription:
      "A case study measuring a 2.3s LCP reduction on a production Next.js app using ISR, image pipeline fixes, and edge-cached OG previews.",
  },
  toneAssessment:
    "Current copy is generic marketing-speak and doesn't signal a technical audience; the rewrite leads with a specific, measured outcome.",
  audienceFit: "mixed",
  contentGaps: [
    "No indication this is a case study with real numbers",
    "og:description reads like a tagline, not a summary",
    "Missing author attribution for credibility",
  ],
  socialCtrTips: [
    "Lead with the outcome (under 1s) before the method",
    "Name the stack explicitly — developers scan for it",
    "Quantify the delta (2.3s) in the first 60 chars",
  ],
  discoverability: {
    schemaOrgRecommendations: [
      "Add Article + Person (author) schema",
      "Add BreadcrumbList for the blog hierarchy",
    ],
    canonicalHealth: "ok",
    hreflangRecommendations: [],
    structuredDataGaps: ["Article present but missing datePublished and author"],
  },
  keywordOpportunities: [
    "next.js performance",
    "largest contentful paint",
    "edge og images",
    "isr case study",
  ],
  severity: "medium",
  confidence: "high",
};
