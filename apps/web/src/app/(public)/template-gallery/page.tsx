import type { ReactElement } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import Image from "next/image";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { fontFamilies } from "@/theme/typography";
import { templateThumbnailUrl } from "@/utils/url";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Every OGStack template in one place. Designs for blogs, docs, changelogs, product launches, GitHub repos, and more - all available on every plan.",
  keywords: [
    "og image templates",
    "open graph templates",
    "blog cover templates",
    "social share templates",
    "twitter card templates",
    "og template gallery",
    "ogstack templates",
  ],
  alternates: { canonical: "/template-gallery" },
};

interface TemplateEntry {
  slug: string;
  name: string;
  description: string;
}

const TEMPLATES: TemplateEntry[] = [
  {
    slug: "aurora",
    name: "Aurora",
    description: "Atmospheric dark gradient with accent glow and dot-grid footer.",
  },
  {
    slug: "editorial",
    name: "Editorial",
    description: "Warm paper-stock essay layout with a graceful serif display.",
  },
  {
    slug: "showcase",
    name: "Showcase",
    description: "Split editorial + tilted card at OG; centered brand card at hero.",
  },
  {
    slug: "billboard",
    name: "Billboard",
    description: "Oversized gradient type with corner marks and radial glows.",
  },
  {
    slug: "blog_card",
    name: "Magazine",
    description: "Category pill, serif headline, and author byline - built for posts.",
  },
  {
    slug: "docs_page",
    name: "Docs IDE",
    description: "Sidebar nav mock, breadcrumb chips, monospace accents.",
  },
  {
    slug: "product_launch",
    name: "Launchpad",
    description: "Radial glow, spark constellation, NEW ribbon, stat chips.",
  },
  {
    slug: "changelog",
    name: "Release Notes",
    description: "Version number stamp and color-coded change rows.",
  },
  {
    slug: "github_repo",
    name: "Open Source",
    description: "Owner / name, star / fork / issue stats, language bar.",
  },
  {
    slug: "minimal",
    name: "Minimal",
    description: "Swiss grid at OG, quiet negative space at wider aspects.",
  },
  {
    slug: "panorama",
    name: "Panorama",
    description: "Two-column editorial + accent-gradient panel with CTA pill.",
  },
];

export default function TemplateGalleryPage(): ReactElement {
  return (
    <>
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 2, md: 3 } }}>
        <Stack spacing={2} sx={{ textAlign: "center", alignItems: "center" }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            Templates
          </Typography>
          <Typography variant="h1">Every template. One meta tag.</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 640 }}>
            Each template is tuned for a specific kind of content. Swap one URL parameter to change
            styles. All tiers include every template - the AI can also pick the right one for you.
          </Typography>
        </Stack>
      </Container>

      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2.5}>
            {TEMPLATES.map((t) => (
              <Grid key={t.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                <Surface
                  variant="quiet"
                  padding={0}
                  sx={{
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      aspectRatio: "1200/630",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Image
                      src={templateThumbnailUrl(t.slug)}
                      alt={`${t.name} template preview`}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </Box>
                  <Stack spacing={1.25} sx={{ p: 2.5, flex: 1 }}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Typography variant="h5">{t.name}</Typography>
                      <Typography
                        sx={{
                          fontFamily: fontFamilies.mono,
                          color: "accent.secondary",
                        }}
                      >
                        {t.slug}
                      </Typography>
                    </Stack>
                    <Typography variant="body2Muted" sx={{ flex: 1 }}>
                      {t.description}
                    </Typography>
                  </Stack>
                </Surface>
              </Grid>
            ))}
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mt: 6, justifyContent: "center", alignItems: "center" }}
          >
            <Button
              href={ROUTES.register}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
            >
              Try in playground
            </Button>
            <Button href={ROUTES.aiShowcase} variant="outlined" size="large">
              See AI-enhanced samples
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
