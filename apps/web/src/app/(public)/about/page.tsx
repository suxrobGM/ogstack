import type { ReactElement } from "react";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { FinalCtaSection } from "@/components/features/landing";
import { Surface } from "@/components/ui/layout/surface";

export const metadata: Metadata = {
  title: "About — OGStack",
  description:
    "OGStack is a developer-first API platform for social preview images. Built to erase the design tax on every link you ship.",
};

const VALUES = [
  {
    title: "Developer-first",
    description:
      "Documented API, one meta tag integration, type-safe SDK. If you can ship a fetch call, you can ship OGStack.",
  },
  {
    title: "AI that earns its keep",
    description:
      "We don't bolt AI on top. The LLM reads the page and grounds every decision in real content — nothing hallucinated.",
  },
  {
    title: "Honest pricing",
    description:
      "Unlimited non-AI renders on every plan. AI is metered because compute costs money, not because we want you to upgrade.",
  },
];

export default function AboutPage(): ReactElement {
  return (
    <>
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 2, md: 3 } }}>
        <Stack spacing={2} sx={{ textAlign: "center", alignItems: "center" }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            About
          </Typography>
          <Typography variant="h1">Preview images, minus the tax</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 640 }}>
            OGStack started with a simple complaint: every time we shipped a blog post, a doc
            update, or a product announcement, someone had to stop engineering to make a Figma
            image. So we built the AI-powered alternative.
          </Typography>
        </Stack>
      </Container>

      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2.5}>
            {VALUES.map((v) => (
              <Grid key={v.title} size={{ xs: 12, md: 4 }}>
                <Surface variant="quiet" padding={3.5} sx={{ height: "100%" }}>
                  <Stack spacing={1.5}>
                    <Typography variant="h4" sx={{ fontSize: 22 }}>
                      {v.title}
                    </Typography>
                    <Typography variant="body2Muted">{v.description}</Typography>
                  </Stack>
                </Surface>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <FinalCtaSection />
    </>
  );
}
