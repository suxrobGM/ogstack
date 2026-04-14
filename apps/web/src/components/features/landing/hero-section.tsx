import type { ReactElement } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ROUTES } from "@/lib/constants";
import { LandingPlayground } from "./landing-playground";

export function HeroSection(): ReactElement {
  return (
    <Box>
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
          <Button href={ROUTES.audit} variant="outlined" size="large">
            Audit your URL
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
