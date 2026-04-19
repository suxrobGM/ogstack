import type { ReactElement } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { AppLogo } from "@/components/icons/app-logo";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound(): ReactElement {
  return (
    <Box
      sx={{
        bgcolor: "surfaces.base",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: { xs: 3, md: 6 }, py: 3 }}>
        <AppLogo />
      </Box>

      <Container
        maxWidth="sm"
        sx={{ flex: 1, display: "flex", alignItems: "center", py: { xs: 6, md: 10 } }}
      >
        <Stack spacing={3} sx={{ textAlign: "center", width: "100%", alignItems: "center" }}>
          <Typography
            component="span"
            sx={{
              fontFamily: "var(--font-newsreader)",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: "clamp(5rem, 14vw, 9rem)",
              color: "accent.primary",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            404
          </Typography>
          <Typography variant="h2">Page not found</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 440 }}>
            The page you&rsquo;re looking for doesn&rsquo;t exist, has been moved, or the URL is
            incorrect.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "center", pt: 1, width: { xs: "100%", sm: "auto" } }}
          >
            <Button href={ROUTES.home} variant="contained" endIcon={<ArrowForwardIcon />}>
              Go to homepage
            </Button>
            <Button href={ROUTES.contact} variant="outlined">
              Contact support
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
