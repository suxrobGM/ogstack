import type { ReactElement } from "react";
import { Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import {
  AiShowcaseSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
} from "@/components/features/landing";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Content-aware AI image generation, AI audit recommendations, AI page analysis, hand-crafted templates, sub-500ms rendering, and a single meta tag.",
  keywords: [
    "og image features",
    "ai content-aware images",
    "og audit",
    "og templates",
    "meta tag api",
    "og image caching",
    "ogstack features",
  ],
  alternates: { canonical: "/features" },
};

export default function FeaturesPage(): ReactElement {
  return (
    <>
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 2, md: 3 } }}>
        <Stack spacing={2} sx={{ textAlign: "center", alignItems: "center" }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            Features
          </Typography>
          <Typography variant="h1">Everything OGStack ships today</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 640 }}>
            A single API platform for social preview images, powered by AI that reads your page
            content. All templates on every tier, generous free usage, unlimited non-AI renders.
          </Typography>
        </Stack>
      </Container>

      <FeaturesSection />
      <HowItWorksSection />
      <AiShowcaseSection limit={6} showCta={false} variant="page" />
      <PricingSection />
    </>
  );
}
