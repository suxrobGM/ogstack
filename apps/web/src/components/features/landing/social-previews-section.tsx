import type { ReactElement } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { line } from "@/theme/palette";
import { radii, shadows } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";

const PLATFORMS = [
  { name: "Twitter / X", url: "my-blog.com" },
  { name: "LinkedIn", url: "my-blog.com" },
  { name: "Slack", url: "my-blog.com" },
];

export function SocialPreviewsSection(): ReactElement {
  return (
    <Box sx={{ pb: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="body2Muted" sx={{ textAlign: "center", mb: 3 }}>
          How it looks everywhere
        </Typography>
        <Grid container spacing={2}>
          {PLATFORMS.map((p) => (
            <Grid key={p.name} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  bgcolor: "surfaces.card",
                  borderRadius: `${radii.md}px`,
                  border: `1px solid ${line.border}`,
                  boxShadow: shadows.md,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    aspectRatio: "2/1",
                    background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
                  }}
                />
                <Box sx={{ px: 1.75, py: 1.5 }}>
                  <Typography
                    sx={{
                      fontFamily: fontFamilies.mono,
                      fontSize: 10,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      mb: 0.5,
                    }}
                  >
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.25 }}>
                    Building with Bun: A Practical Guide
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{p.url}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
