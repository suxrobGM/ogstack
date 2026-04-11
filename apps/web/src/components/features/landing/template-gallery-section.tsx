import type { ReactElement } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { radii } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";

const TEMPLATES = [
  { name: "gradient_dark", bg: "linear-gradient(135deg, #0f172a, #1e293b)" },
  { name: "gradient_light", bg: "linear-gradient(135deg, #fafaf8, #e2e8f0)" },
  { name: "split_hero", bg: "linear-gradient(135deg, #7c3aed, #2563eb)" },
  { name: "centered_bold", bg: "linear-gradient(135deg, #059669, #0d9488)" },
  { name: "blog_card", bg: "linear-gradient(135deg, #dc2626, #ea580c)" },
  { name: "docs_page", bg: "linear-gradient(135deg, #1e1b4b, #312e81)" },
  { name: "product_launch", bg: "linear-gradient(135deg, #0c4a6e, #0369a1)" },
  { name: "changelog", bg: "linear-gradient(135deg, #365314, #4d7c0f)" },
  { name: "github_repo", bg: "linear-gradient(135deg, #78350f, #a16207)" },
  { name: "minimal", bg: "linear-gradient(135deg, #1c1917, #292524)" },
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
          {TEMPLATES.map((t) => (
            <Grid key={t.name} size={{ xs: 6, sm: 4, md: 2.4 }}>
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
                <Box sx={{ width: "100%", height: "100%", background: t.bg }} />
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
                  {t.name}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
