import type { ReactElement } from "react";
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
  SocialPreviewsSection,
} from "@/components/features/landing";

export default function HomePage(): ReactElement {
  return (
    <>
      <HeroSection />
      <AiShowcaseSection limit={3} />
      <HowItWorksSection />
      <ProblemsSection />
      <FeaturesSection />
      <AuditPromoSection />
      <SocialPreviewsSection />
      <FeaturedTemplatesSection />
      <CodeSection />
      <PricingSection />
      <FinalCtaSection />
    </>
  );
}
