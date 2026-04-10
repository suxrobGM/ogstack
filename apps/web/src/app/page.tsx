import type { ReactElement } from "react";
import { Box } from "@mui/material";
import { FeaturesSection } from "@/components/features/landing/features-section";
import { Footer } from "@/components/features/landing/footer";
import { HeroSection } from "@/components/features/landing/hero-section";
import { HowItWorksSection } from "@/components/features/landing/how-it-works-section";
import { PricingSection } from "@/components/features/landing/pricing-section";

export default function HomePage(): ReactElement {
  return (
    <Box sx={{ bgcolor: "aubergine.base", minHeight: "100vh" }}>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <Footer />
    </Box>
  );
}
