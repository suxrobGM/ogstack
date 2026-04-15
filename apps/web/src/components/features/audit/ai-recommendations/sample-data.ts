import type { AuditReportResponse } from "@/types/api";

export type AiInsights = NonNullable<AuditReportResponse["aiAnalysis"]>;

export const SAMPLE_INSIGHTS: AiInsights = {
  suggestedOgTitle: "Cut LCP to under 1s on Next.js — measured",
  suggestedOgDescription:
    "How we shaved 2.3s off Largest Contentful Paint by fixing the image pipeline, moving landing to ISR, and serving OG previews from the edge.",
  suggestedTwitterTitle: "We got LCP under 1s on Next.js. Here's the before/after.",
  suggestedTwitterDescription:
    "A concrete performance overhaul: image pipeline, edge-cached OG previews, ISR landing. Real Speed Insights numbers, not synthetic.",
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
  severity: "medium",
  confidence: "high",
};
