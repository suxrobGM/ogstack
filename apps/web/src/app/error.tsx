"use client";

import type { ReactElement } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { AppLogo } from "@/components/icons/app-logo";
import { ROUTES } from "@/lib/constants";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage(props: ErrorPageProps): ReactElement {
  const { error, reset } = props;

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
              color: "feedback.error",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            500
          </Typography>
          <Typography variant="h2">Something went wrong</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 480 }}>
            An unexpected error occurred while loading this page. Try again, or head back to the
            homepage. If the problem persists, let us know.
          </Typography>
          {error.digest && (
            <Typography
              variant="captionMuted"
              sx={{ fontFamily: "var(--font-jetbrains-mono)", opacity: 0.8 }}
            >
              Error ID: {error.digest}
            </Typography>
          )}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "center", pt: 1, width: { xs: "100%", sm: "auto" } }}
          >
            <Button onClick={reset} variant="contained" startIcon={<RefreshIcon />}>
              Try again
            </Button>
            <Button href={ROUTES.home} variant="outlined">
              Go to homepage
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
