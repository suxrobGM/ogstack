import type { ReactElement } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import Image from "next/image";
import { radii } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";
import { templateThumbnailUrl } from "@/utils/og-image";

const TEMPLATES = [
  "aurora",
  "editorial",
  "showcase",
  "billboard",
  "blog_card",
  "docs_page",
  "product_launch",
  "changelog",
  "github_repo",
  "minimal",
  "panorama",
];

export function TemplateGallerySection(): ReactElement {
  return (
    <Box id="templates" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="overline" sx={{ color: "accent.primary", display: "block", mb: 1.5 }}>
          Templates
        </Typography>
        <Typography variant="h2" sx={{ mb: 5 }}>
          Pick a style. Or let us choose.
        </Typography>
        <Grid container spacing={1.5}>
          {TEMPLATES.map((slug) => (
            <Grid key={slug} size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Box
                sx={{
                  aspectRatio: "1200/630",
                  borderRadius: `${radii.md}px`,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: `2px solid transparent`,
                  transition: "border-color 200ms, transform 200ms",
                  position: "relative",
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
                  sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 20vw"
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
                    color: "rgba(255,255,255,0.7)",
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
