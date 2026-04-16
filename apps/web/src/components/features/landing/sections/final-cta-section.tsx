import type { ReactElement } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";

export function FinalCtaSection(): ReactElement {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <Surface variant="expressive" sx={{ p: { xs: 5, md: 7 }, textAlign: "center" }}>
          <Stack spacing={3} sx={{ alignItems: "center" }}>
            <Typography variant="h2" sx={{ maxWidth: 560 }}>
              Start generating on-brand previews in 60 seconds
            </Typography>
            <Typography variant="body1Muted" sx={{ maxWidth: 520 }}>
              Free forever for hobby projects. No credit card. Every template, content-aware AI, and
              unlimited non-AI renders.
            </Typography>
            <Button
              href={ROUTES.register}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
            >
              Create a free account
            </Button>
          </Stack>
        </Surface>
      </Container>
    </Box>
  );
}
