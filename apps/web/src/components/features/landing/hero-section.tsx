import type { ReactElement } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ROUTES } from "@/lib/constants";
import { gradients } from "@/theme/tokens";

export function HeroSection(): ReactElement {
  return (
    <Box
      sx={{
        pt: { xs: 12, md: 20 },
        pb: { xs: 10, md: 16 },
        textAlign: "center",
        backgroundImage: gradients.mesh,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="md">
        <Typography variant="overline" sx={{ color: "accent.sunset", mb: 3, display: "block" }}>
          Developer-first OG image platform
        </Typography>
        <Typography
          variant="h1"
          sx={{
            backgroundImage: gradients.heroText,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
          }}
        >
          Beautiful social previews. Zero effort.
        </Typography>
        <Typography
          variant="body1Muted"
          sx={{ maxWidth: 560, mx: "auto", mb: 5, fontSize: "1.125rem", lineHeight: 1.7 }}
        >
          A single meta tag or API call produces contextual social preview images for any URL. No
          design tools, no templates to maintain, no effort required.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
          <Button href={ROUTES.register} variant="contained" size="large">
            Get started free
          </Button>
          <Button href={ROUTES.docs} variant="outlined" size="large">
            Read the docs
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
