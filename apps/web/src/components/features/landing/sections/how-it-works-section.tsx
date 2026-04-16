import type { ReactElement } from "react";
import type { SvgIconComponent } from "@mui/icons-material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import { fontFamilies } from "@/theme/typography";

interface Step {
  icon: SvgIconComponent;
  step: string;
  title: string;
  description: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    icon: LinkIcon,
    step: "01",
    title: "Paste a URL",
    description:
      "Any public page. We scrape the DOM, extract Open Graph tags, key content, and the real article body — safely, with SSRF protection on.",
    detail: "Avg. 200–400ms",
  },
  {
    icon: AutoAwesomeIcon,
    step: "02",
    title: "AI reads the content",
    description:
      "An LLM runs page analysis and produces structured seeds: headline, tagline, topics, tone, suggested palette, and mood — cached per URL.",
    detail: "Runs on every AI generation + audit",
  },
  {
    icon: ImageIcon,
    step: "03",
    title: "Image rendered & cached",
    description:
      "Seeds prompt a best-in-class image model at Standard or Pro quality. The output lands in our CDN cache and serves in <100ms for every subsequent hit.",
    detail: "< 8s p95 first-gen · cached globally",
  },
];

export function HowItWorksSection(): ReactElement {
  return (
    <Box id="how-it-works" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} sx={{ mb: 5, maxWidth: 620 }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            How it works
          </Typography>
          <Typography variant="h2">From URL to on-brand preview in three steps</Typography>
        </Stack>
        <Grid container spacing={2.5}>
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <Grid key={s.step} size={{ xs: 12, md: 4 }}>
                <Surface variant="quiet" padding={3.5} sx={{ height: "100%" }}>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{
                          fontFamily: fontFamilies.mono,
                          fontSize: 12,
                          color: "accent.secondary",
                          letterSpacing: "0.18em",
                        }}
                      >
                        STEP {s.step}
                      </Typography>
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
                    </Stack>
                    <Typography variant="h4" sx={{ fontSize: 22 }}>
                      {s.title}
                    </Typography>
                    <Typography variant="body2Muted">{s.description}</Typography>
                    <Typography
                      variant="captionMuted"
                      sx={{
                        fontFamily: fontFamilies.mono,
                        fontSize: 11,
                        pt: 1,
                        borderTop: "1px dashed",
                        borderColor: "divider",
                      }}
                    >
                      {s.detail}
                    </Typography>
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
