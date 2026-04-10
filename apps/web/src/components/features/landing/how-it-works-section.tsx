import type { ReactElement } from "react";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { line } from "@/theme/palette";
import { gradients } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";

const STEPS = [
  {
    number: "01",
    title: "Create a project",
    description: "Sign up and create a project in seconds. Get your public project ID.",
  },
  {
    number: "02",
    title: "Add the meta tag",
    description: "Paste a single <meta> tag into your page's <head>. That's it.",
  },
  {
    number: "03",
    title: "Share your link",
    description:
      "When someone shares your URL on social media, OGStack generates and serves a beautiful preview image.",
  },
];

export function HowItWorksSection(): ReactElement {
  return (
    <Box sx={{ py: { xs: 10, md: 14 }, borderTop: `1px solid ${line.divider}` }}>
      <Container maxWidth="lg">
        <Typography
          variant="overline"
          sx={{ color: "accent.sunset", display: "block", textAlign: "center", mb: 2 }}
        >
          How it works
        </Typography>
        <Typography variant="h2" sx={{ textAlign: "center", mb: 8 }}>
          Three steps to beautiful previews
        </Typography>
        <Grid container spacing={4}>
          {STEPS.map((step) => (
            <Grid key={step.number} size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Typography
                  sx={{
                    fontFamily: fontFamilies.mono,
                    fontSize: "3rem",
                    fontWeight: 700,
                    backgroundImage: gradients.sunsetAmber,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </Typography>
                <Typography variant="h4">{step.title}</Typography>
                <Typography variant="body2Muted">{step.description}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
