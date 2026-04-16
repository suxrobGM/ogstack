import type { ReactElement } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import Image from "next/image";
import { line } from "@/theme/palette";
import { radii, shadows } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";
import { templateThumbnailUrl } from "@/utils/og-image";

const PLATFORMS = [
  {
    name: "Twitter / X",
    url: "my-blog.com",
    title: "Building with Bun: A Practical Guide",
    template: "gradient_dark",
  },
  {
    name: "LinkedIn",
    url: "my-blog.com",
    title: "Scaling Postgres for the next 10×",
    template: "split_hero",
  },
  {
    name: "Slack",
    url: "my-blog.com",
    title: "Shipping faster with preview deploys",
    template: "centered_bold",
  },
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
                <Box sx={{ position: "relative", aspectRatio: "2/1" }}>
                  <Image
                    src={templateThumbnailUrl(p.template)}
                    alt={`${p.title} — ${p.template}`}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Box sx={{ px: 1.75, py: 1.5 }}>
                  <Typography
                    variant="body1Muted"
                    sx={{
                      fontFamily: fontFamilies.mono,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      mb: 0.5,
                    }}
                  >
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.25 }}>
                    {p.title}
                  </Typography>
                  <Typography variant="body1Muted" sx={{ fontSize: 11 }}>
                    {p.url}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
