import type { ReactElement } from "react";
import { Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import {
  AiShowcaseSection,
  FinalCtaSection,
  HowItWorksSection,
} from "@/components/features/landing";

export const metadata: Metadata = {
  title: "How it works — OGStack",
  description:
    "From URL to on-brand preview in three steps: scrape, AI page analysis, and cached render. See the full pipeline.",
};

export default function HowItWorksPage(): ReactElement {
  return (
    <>
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 2, md: 3 } }}>
        <Stack spacing={2} sx={{ textAlign: "center", alignItems: "center" }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            How it works
          </Typography>
          <Typography variant="h1">From URL to preview image</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 640 }}>
            Three steps. No design tooling, no manual prompting, no CDN to set up. Paste a URL and
            we take care of the rest — complete with caching and SSRF-safe scraping.
          </Typography>
        </Stack>
      </Container>

      <HowItWorksSection />
      <AiShowcaseSection limit={3} showCta={false} variant="page" />
      <FinalCtaSection />
    </>
  );
}
