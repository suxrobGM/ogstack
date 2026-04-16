import type { ReactElement } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { radii } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";
import { templateThumbnailUrl } from "@/utils/og-image";

const FEATURED = ["gradient_dark", "split_hero", "blog_card", "product_launch"];

export function FeaturedTemplatesSection(): ReactElement {
  return (
    <Box id="templates" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{
            mb: 5,
            alignItems: { md: "flex-end" },
            justifyContent: "space-between",
          }}
        >
          <Stack spacing={1.5} sx={{ maxWidth: 560 }}>
            <Typography variant="overline" sx={{ color: "accent.primary" }}>
              Templates
            </Typography>
            <Typography variant="h2">Start from a template — or let the AI pick</Typography>
            <Typography variant="body1Muted">
              Hand-tuned designs at 1200×630, each optimized for a specific kind of content. Preview
              live, swap with one param.
            </Typography>
          </Stack>
          <Button href={ROUTES.templateGallery} variant="outlined" endIcon={<ArrowForwardIcon />}>
            Browse all templates
          </Button>
        </Stack>
        <Grid container spacing={2}>
          {FEATURED.map((slug) => (
            <Grid key={slug} size={{ xs: 6, md: 3 }}>
              <Box
                component="a"
                href={ROUTES.templateGallery}
                sx={{
                  aspectRatio: "1200/630",
                  display: "block",
                  borderRadius: `${radii.md}px`,
                  overflow: "hidden",
                  border: "2px solid transparent",
                  position: "relative",
                  transition: "border-color 200ms, transform 200ms",
                  "&:hover": {
                    borderColor: "accent.primary",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Image
                  src={templateThumbnailUrl(slug)}
                  alt={slug}
                  fill
                  sizes="(max-width: 600px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    px: 1.25,
                    py: 0.75,
                    bgcolor: "rgba(0,0,0,0.65)",
                    fontFamily: fontFamilies.mono,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {slug}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
