import type { ReactElement } from "react";
import { Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { AiShowcaseSection, FinalCtaSection } from "@/components/features/landing";

export const metadata: Metadata = {
  title: "AI showcase",
  description:
    "Real URLs, real AI-generated previews. See what OGStack's content-aware image generation produces at Standard and Pro quality — no manual prompting required.",
  keywords: [
    "ai og image examples",
    "content-aware ai showcase",
    "ai generated open graph",
    "og image samples",
    "ai preview generator",
    "pro quality og",
  ],
  alternates: { canonical: "/ai-showcase" },
};

export default function AiShowcasePage(): ReactElement {
  return (
    <>
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 2, md: 3 } }}>
        <Stack spacing={2} sx={{ textAlign: "center", alignItems: "center" }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            AI showcase
          </Typography>
          <Typography variant="h1">The AI, in the wild</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 640 }}>
            Every card is a real public URL. Our pipeline scraped it, the LLM analyzed the content,
            and the render was produced with zero manual prompting. Standard uses our fast model,
            Pro uses the premium quality tier.
          </Typography>
        </Stack>
      </Container>

      <AiShowcaseSection showCta={false} variant="page" />
      <FinalCtaSection />
    </>
  );
}
