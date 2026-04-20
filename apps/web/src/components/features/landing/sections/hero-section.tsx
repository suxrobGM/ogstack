import type { ReactElement } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { ROUTES } from "@/lib/constants";
import { LandingPlayground } from "../playground";

export function HeroSection(): ReactElement {
  return (
    <Box>
      <Container
        maxWidth="md"
        sx={{ pt: { xs: 5, sm: 6, md: 8 }, pb: { xs: 3, md: 4 }, textAlign: "center" }}
      >
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
          label="Now with AI image generation for OG, blog heroes, and favicons"
          size="small"
          sx={{
            mb: 2,
            bgcolor: "rgba(180,83,9,0.10)",
            color: "accent.primary",
            border: "1px solid rgba(180,83,9,0.22)",
            "& .MuiChip-icon": { color: "accent.primary" },
          }}
        />
        <Typography variant="h1" sx={{ mb: 1.5 }}>
          Branded images that
          <br />
          <Box component="em" sx={{ fontStyle: "italic", color: "accent.primary" }}>
            read your page
          </Box>
        </Typography>
        <Typography
          variant="body1Muted"
          sx={{
            maxWidth: 620,
            mx: "auto",
            mb: { xs: 3, md: 3.5 },
            fontSize: "1rem",
            lineHeight: 1.65,
          }}
        >
          Paste a URL. We generate OG images, blog covers, and full favicon sets - the AI reads the
          content, picks the headline, tone, and palette, and renders designed assets in seconds.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            mb: { xs: 4, md: 5 },
          }}
        >
          <Button
            href={ROUTES.register}
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
          >
            Start for free
          </Button>
          <Button href={ROUTES.howItWorks} variant="outlined" size="large">
            See how it works
          </Button>
        </Stack>
      </Container>

      <Container maxWidth="md" sx={{ pb: { xs: 6, md: 8 } }}>
        <LandingPlayground />
      </Container>
    </Box>
  );
}
