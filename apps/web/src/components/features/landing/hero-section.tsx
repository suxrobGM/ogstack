import type { ReactElement } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ROUTES } from "@/lib/constants";
import { fontFamilies } from "@/theme/typography";
import { LandingPlayground } from "./landing-playground";

export function HeroSection(): ReactElement {
  return (
    <Box>
      {/* Nav */}
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            py: 2.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: fontFamilies.body,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: "-0.5px",
              "& span": { color: "accent.primary" },
            }}
          >
            og<span>stack</span>
          </Typography>
          <Stack direction="row" spacing={3.5} sx={{ alignItems: "center" }}>
            <Typography
              component="a"
              href={ROUTES.docs}
              sx={{
                fontSize: 14,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "text.primary" },
              }}
            >
              Docs
            </Typography>
            <Typography
              component="a"
              href="#templates"
              sx={{
                fontSize: 14,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "text.primary" },
              }}
            >
              Templates
            </Typography>
            <Typography
              component="a"
              href="#pricing"
              sx={{
                fontSize: 14,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "text.primary" },
              }}
            >
              Pricing
            </Typography>
            <Button href={ROUTES.register} variant="contained" size="small">
              Get started
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Hero content */}
      <Container
        maxWidth="md"
        sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 5, md: 6 }, textAlign: "center" }}
      >
        <Typography variant="overline" sx={{ color: "accent.primary", mb: 2, display: "block" }}>
          Developer API Platform
        </Typography>
        <Typography variant="h1" sx={{ mb: 2 }}>
          Social previews that
          <br />
          look{" "}
          <Box component="em" sx={{ fontStyle: "italic", color: "accent.primary" }}>
            designed
          </Box>
        </Typography>
        <Typography
          variant="body1Muted"
          sx={{
            maxWidth: 480,
            mx: "auto",
            mb: 5,
            fontSize: "1.0625rem",
            lineHeight: 1.7,
          }}
        >
          One meta tag generates beautiful Open Graph images for any URL. No Figma, no screenshots,
          no manual work.
        </Typography>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: "center", mb: { xs: 6, md: 8 } }}
        >
          <Button href={ROUTES.register} variant="contained" size="large">
            Start for free
          </Button>
          <Button href={ROUTES.docs} variant="outlined" size="large">
            Read the docs
          </Button>
        </Stack>
      </Container>

      {/* Interactive playground card */}
      <Container maxWidth="md" sx={{ pb: { xs: 8, md: 12 } }}>
        <LandingPlayground />
      </Container>
    </Box>
  );
}
