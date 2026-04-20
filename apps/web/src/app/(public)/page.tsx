import type { ReactElement } from "react";
import type { Metadata } from "next";
import {
  AiShowcaseSection,
  AuditPromoSection,
  CodeSection,
  FeaturedTemplatesSection,
  FeaturesSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  PricingSection,
  ProblemsSection,
} from "@/components/features/landing";

export const metadata: Metadata = {
  title: {
    absolute: "OGStack - Branded OG images, blog covers & favicons for any URL",
  },
  description:
    "A single API platform for on-brand social previews. Content-aware AI renders Open Graph images, blog covers, and favicon sets from any URL - via one meta tag or a POST request.",
  keywords: [
    "og image generator",
    "open graph images",
    "blog cover generator",
    "favicon generator",
    "twitter card generator",
    "ai image generation",
    "link preview api",
    "social share images",
    "developer-first",
    "ogstack",
  ],
  alternates: { canonical: "/" },
};

export default function HomePage(): ReactElement {
  return (
    <>
      <HeroSection />
      <AiShowcaseSection limit={3} />
      <HowItWorksSection />
      <ProblemsSection />
      <FeaturesSection />
      <AuditPromoSection />
      <FeaturedTemplatesSection />
      <CodeSection />
      <PricingSection />
      <FinalCtaSection />
    </>
  );
}
