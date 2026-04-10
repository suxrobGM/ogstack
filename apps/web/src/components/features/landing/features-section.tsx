import type { ReactElement } from "react";
import CodeIcon from "@mui/icons-material/Code";
import ImageIcon from "@mui/icons-material/Image";
import SpeedIcon from "@mui/icons-material/Speed";
import TuneIcon from "@mui/icons-material/Tune";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";

const FEATURES = [
  {
    icon: <CodeIcon />,
    title: "One meta tag",
    description:
      "Drop a single <meta> tag into your HTML. OGStack handles the rest — scraping, rendering, and CDN delivery.",
  },
  {
    icon: <ImageIcon />,
    title: "10+ templates",
    description:
      "Gradient, split-hero, blog card, docs page, and more. Each template adapts to your content automatically.",
  },
  {
    icon: <SpeedIcon />,
    title: "Sub-500ms rendering",
    description:
      "Template images render in under 500ms at the p95. Cached on a global CDN for instant repeat serves.",
  },
  {
    icon: <TuneIcon />,
    title: "Full API control",
    description:
      "POST endpoint for programmatic generation. Pass custom colors, fonts, logos, and AI-generated backgrounds.",
  },
];

export function FeaturesSection(): ReactElement {
  return (
    <Box sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="overline"
          sx={{ color: "accent.sunset", display: "block", textAlign: "center", mb: 2 }}
        >
          Features
        </Typography>
        <Typography variant="h2" sx={{ textAlign: "center", mb: 8 }}>
          Everything you need for social previews
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 3,
          }}
        >
          {FEATURES.map((f) => (
            <Surface key={f.title} variant="quiet" padding={4} sx={{ height: "100%" }}>
              <Stack spacing={2}>
                <Box sx={{ color: "accent.sunset", fontSize: 32 }}>{f.icon}</Box>
                <Typography variant="h5">{f.title}</Typography>
                <Typography variant="body2Muted">{f.description}</Typography>
              </Stack>
            </Surface>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
