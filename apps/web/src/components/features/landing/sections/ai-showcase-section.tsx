import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Box, Button, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { radii } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";
import { AI_SAMPLES, aiSampleUrl, type AiSample } from "./ai-samples-data";

interface AiShowcaseSectionProps {
  limit?: number;
  showCta?: boolean;
  variant?: "landing" | "page";
}

export function AiShowcaseSection(props: AiShowcaseSectionProps): ReactElement {
  const { limit, showCta = true, variant = "landing" } = props;
  const samples = typeof limit === "number" ? AI_SAMPLES.slice(0, limit) : AI_SAMPLES;

  return (
    <Box id="ai-showcase" sx={{ py: { xs: 8, md: 12 }, bgcolor: "surfaces.elevated" }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} sx={{ mb: 5, maxWidth: 720 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AutoAwesomeIcon sx={{ color: "accent.primary", fontSize: 18 }} />
            <Typography variant="overline" sx={{ color: "accent.primary" }}>
              AI Showcase
            </Typography>
          </Stack>
          <Typography variant="h2">See the AI read actual pages</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 620 }}>
            Each card below is a real URL our pipeline scraped, analyzed, and rendered. The seeds
            are exactly what the language model extracted — no manual prompting.
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          {samples.map((s) => (
            <Grid key={`${s.slug}-${s.quality}`} size={{ xs: 12, sm: 6, md: 4 }}>
              <SampleCard sample={s} />
            </Grid>
          ))}
        </Grid>

        {showCta && variant === "landing" && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mt: 5, justifyContent: "center", alignItems: "center" }}
          >
            <Button href={ROUTES.aiShowcase} variant="outlined" size="large">
              Browse the full AI showcase
            </Button>
            <Button href={ROUTES.register} variant="contained" size="large">
              Try it on your URL
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
}

interface SampleCardProps {
  sample: AiSample;
}

function SampleCard(props: SampleCardProps): ReactElement {
  const { sample } = props;

  return (
    <Surface
      variant="quiet"
      padding={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "1200/630",
          bgcolor: "surfaces.base",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Image
          src={aiSampleUrl(sample)}
          alt={`AI-generated OG image for ${sample.sourceUrl}`}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
        <Chip
          label={sample.quality === "pro" ? "Pro" : "Standard"}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bgcolor: sample.quality === "pro" ? "accent.primary" : "rgba(255,255,255,0.92)",
            color: sample.quality === "pro" ? "#FFFDF9" : "text.primary",
            letterSpacing: "0.08em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        />
      </Box>
      <Stack spacing={1.5} sx={{ p: 2.5 }}>
        <Typography
          variant="captionMuted"
          sx={{
            fontFamily: fontFamilies.mono,
            color: "accent.secondary",
            letterSpacing: "0.06em",
          }}
        >
          {sample.template.replace(/_/g, " ")}
        </Typography>
        <Typography variant="h6" sx={{ fontSize: 16 }}>
          {sample.seeds.headline}
        </Typography>
        <Typography variant="body2Muted" sx={{ fontSize: 13 }}>
          {sample.seeds.tagline}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
          {sample.seeds.mood.split(",").map((m) => (
            <Chip
              key={m}
              label={m.trim()}
              size="small"
              variant="outlined"
              sx={{
                borderRadius: `${radii.sm}px`,
                height: 22,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          ))}
        </Stack>
        <Typography
          variant="captionMuted"
          sx={{ fontFamily: fontFamilies.mono, fontSize: 11, wordBreak: "break-all" }}
        >
          {sample.sourceUrl}
        </Typography>
      </Stack>
    </Surface>
  );
}
