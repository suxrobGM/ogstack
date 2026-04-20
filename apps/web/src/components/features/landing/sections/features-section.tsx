import type { ReactElement } from "react";
import type { SvgIconComponent } from "@mui/icons-material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import CodeIcon from "@mui/icons-material/Code";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import InsightsIcon from "@mui/icons-material/Insights";
import LandscapeIcon from "@mui/icons-material/Landscape";
import PhotoFilterIcon from "@mui/icons-material/PhotoFilter";
import PsychologyIcon from "@mui/icons-material/Psychology";
import StarsIcon from "@mui/icons-material/Stars";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";

interface Feature {
  icon: SvgIconComponent;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: PhotoFilterIcon,
    title: "OG preview images",
    description:
      "1200×630 social previews. Template or AI. One meta tag covers Twitter, LinkedIn, Slack, Discord, iMessage - every platform a crawler visits.",
  },
  {
    icon: LandscapeIcon,
    title: "Blog covers & heroes",
    description:
      "1600×900 and 1920×1080 hero art for blog posts and landing pages. Five hand-tuned templates, each optionally AI-enhanced with your brand palette.",
  },
  {
    icon: StarsIcon,
    title: "Favicon + app icon sets",
    description:
      "Paste a URL, get the full icon kit: favicon.ico, apple-touch-icon, manifest 192/512, and the matching <link> snippet. AI-generated from your brand seeds.",
  },
  {
    icon: AutoAwesomeIcon,
    title: "Content-aware AI images",
    description:
      "Our LLM reads the page, extracts the key message, and prompts a best-in-class image model to render on-brand output - no design effort required.",
  },
  {
    icon: InsightsIcon,
    title: "AI audit recommendations",
    description:
      "Score any URL 0–100 across OG, Twitter card, and SEO hygiene. Get priority actions, suggested rewrites, search-snippet variants, and keyword opportunities.",
  },
  {
    icon: PsychologyIcon,
    title: "AI page analysis",
    description:
      "Structured extraction of headline, tagline, topics, pageTheme, brand palette, and content signals - reused across image generation and audits.",
  },
  {
    icon: DashboardCustomizeIcon,
    title: "Hand-crafted templates",
    description:
      "Gradient, split hero, blog card, docs page, changelog, GitHub repo, minimal, and more. All tiers, optionally AI-enhanced.",
  },
  {
    icon: BoltIcon,
    title: "Sub-500ms, cached globally",
    description:
      "Template renders hit p95 under 500ms. CDN cache hit ratio above 90%. Fast enough for any crawler, fast enough for humans.",
  },
  {
    icon: CodeIcon,
    title: "One meta tag, full API",
    description:
      'Drop a GET URL into <meta property="og:image"> or call the POST endpoint from your backend. Either way - it\'s one line.',
  },
];

export function FeaturesSection(): ReactElement {
  return (
    <Box id="features" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="overline" sx={{ color: "accent.primary", display: "block", mb: 1.5 }}>
          Features
        </Typography>
        <Typography variant="h2" sx={{ mb: 6, maxWidth: 620 }}>
          A branded image API, powered by AI that reads your page
        </Typography>
        <Grid container spacing={2.5}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
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
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h5">{f.title}</Typography>
                    <Typography variant="body2Muted">{f.description}</Typography>
                  </Stack>
                </Surface>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
