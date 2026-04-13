import type { ReactElement } from "react";
import { Box } from "@mui/material";
import { AuditPromoSection } from "@/components/features/landing/audit-promo-section";
import { CodeSection } from "@/components/features/landing/code-section";
import { FeaturesSection } from "@/components/features/landing/features-section";
import { Footer } from "@/components/features/landing/footer";
import { HeroSection } from "@/components/features/landing/hero-section";
import { PricingSection } from "@/components/features/landing/pricing-section";
import { SocialPreviewsSection } from "@/components/features/landing/social-previews-section";
import { TemplateGallerySection } from "@/components/features/landing/template-gallery-section";

export default function HomePage(): ReactElement {
  return (
    <Box sx={{ bgcolor: "surfaces.base", minHeight: "100vh" }}>
      <HeroSection />
      <SocialPreviewsSection />
      <AuditPromoSection />
      <FeaturesSection />
      <CodeSection />
      <TemplateGallerySection />
      <PricingSection />
      <Footer />
    </Box>
  );
}
