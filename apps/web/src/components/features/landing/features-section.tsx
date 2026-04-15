import type { ReactElement } from "react";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";

const FEATURES = [
  {
    icon: "</>",
    title: "One meta tag",
    description:
      "Add a single line to your HTML. We handle scraping, rendering, caching, and CDN delivery.",
  },
  {
    icon: "#",
    title: "10+ templates",
    description:
      "Gradient, split hero, blog card, docs page, changelog \u2014 each designed for specific content.",
  },
  {
    icon: "\u2193",
    title: "Sub-500ms",
    description:
      "Template rendering at p95 latency. CDN cache hit ratio above 90%. Fast everywhere.",
  },
  {
    icon: "{}",
    title: "Full API",
    description:
      "GET for meta tags, POST for server-side. Control template, colors, fonts, AI backgrounds.",
  },
  {
    icon: "AI",
    title: "AI backgrounds",
    description:
      "Best-in-class vision models generate contextual backgrounds from your page content.",
  },
  {
    icon: "\u2261",
    title: "Brand Kit",
    description:
      "Upload your logo, set brand colors and fonts. Every generated image stays on-brand.",
  },
];

export function FeaturesSection(): ReactElement {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="overline" sx={{ color: "accent.primary", display: "block", mb: 1.5 }}>
          Features
        </Typography>
        <Typography variant="h2" sx={{ mb: 6, maxWidth: 480 }}>
          Everything you need, nothing you don&apos;t
        </Typography>
        <Grid container spacing={2.5}>
          {FEATURES.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Surface
                variant="quiet"
                padding={3.5}
                sx={{
                  height: "100%",
                  transition: "box-shadow 240ms, transform 240ms",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(44,40,37,0.08), 0 16px 40px rgba(44,40,37,0.06)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(180,83,9,0.08)",
                      color: "accent.primary",
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="h5">{f.title}</Typography>
                  <Typography variant="body2Muted">{f.description}</Typography>
                </Stack>
              </Surface>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
