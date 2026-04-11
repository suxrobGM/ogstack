import type { ReactElement } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ROUTES } from "@/lib/constants";
import { line, surfaces } from "@/theme/palette";
import { radii, shadows } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";

export function HeroSection(): ReactElement {
  return (
    <Box>
      {/* Nav */}
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            py: 2.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: fontFamilies.body,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: "-0.5px",
              "& span": { color: "accent.primary" },
            }}
          >
            og<span>stack</span>
          </Typography>
          <Stack direction="row" spacing={3.5} sx={{ alignItems: "center" }}>
            <Typography
              component="a"
              href={ROUTES.docs}
              sx={{
                fontSize: 14,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "text.primary" },
              }}
            >
              Docs
            </Typography>
            <Typography
              component="a"
              href="#templates"
              sx={{
                fontSize: 14,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "text.primary" },
              }}
            >
              Templates
            </Typography>
            <Typography
              component="a"
              href="#pricing"
              sx={{
                fontSize: 14,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "text.primary" },
              }}
            >
              Pricing
            </Typography>
            <Button href={ROUTES.register} variant="contained" size="small">
              Get started
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Hero content */}
      <Container
        maxWidth="md"
        sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 5, md: 6 }, textAlign: "center" }}
      >
        <Typography variant="overline" sx={{ color: "accent.primary", mb: 2, display: "block" }}>
          Developer API Platform
        </Typography>
        <Typography variant="h1" sx={{ mb: 2 }}>
          Social previews that
          <br />
          look{" "}
          <Box component="em" sx={{ fontStyle: "italic", color: "accent.primary" }}>
            designed
          </Box>
        </Typography>
        <Typography
          variant="body1Muted"
          sx={{
            maxWidth: 480,
            mx: "auto",
            mb: 5,
            fontSize: "1.0625rem",
            lineHeight: 1.7,
          }}
        >
          One meta tag generates beautiful Open Graph images for any URL. No Figma, no screenshots,
          no manual work.
        </Typography>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: "center", mb: { xs: 6, md: 8 } }}
        >
          <Button href={ROUTES.register} variant="contained" size="large">
            Start for free
          </Button>
          <Button href={ROUTES.docs} variant="outlined" size="large">
            Read the docs
          </Button>
        </Stack>
      </Container>

      {/* Interactive playground card */}
      <Container maxWidth="md" sx={{ pb: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            bgcolor: surfaces.card,
            borderRadius: `${radii.lg}px`,
            border: `1px solid ${line.border}`,
            boxShadow: shadows.lg,
            overflow: "hidden",
          }}
        >
          {/* Browser bar */}
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 0.75,
              px: 2,
              py: 1.5,
              bgcolor: surfaces.elevated,
              borderBottom: `1px solid ${line.border}`,
            }}
          >
            {["#FECACA", "#FEF08A", "#BBF7D0"].map((bg, i) => (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: bg,
                  border: `1.5px solid ${["#F87171", "#FACC15", "#4ADE80"][i]}`,
                }}
              />
            ))}
            <Typography
              sx={{
                flex: 1,
                textAlign: "center",
                fontFamily: fontFamilies.mono,
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              ogstack.dev/playground
            </Typography>
          </Stack>

          {/* Input row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ p: 2, gap: 1, borderBottom: `1px solid ${line.border}` }}
          >
            <Box
              component="input"
              readOnly
              value="https://my-blog.com/building-with-bun"
              sx={{
                flex: 1,
                px: 1.75,
                py: 1.25,
                bgcolor: surfaces.base,
                border: `1px solid ${line.border}`,
                borderRadius: `8px`,
                fontFamily: fontFamilies.mono,
                fontSize: 13,
                color: "text.primary",
                outline: "none",
              }}
            />
            <Button variant="contained" sx={{ flexShrink: 0 }}>
              Generate
            </Button>
          </Stack>

          {/* Template selector */}
          <Stack
            direction="row"
            sx={{
              gap: 0.75,
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${line.border}`,
              overflowX: "auto",
            }}
          >
            {[
              "gradient_dark",
              "gradient_light",
              "split_hero",
              "blog_card",
              "centered_bold",
              "docs_page",
              "minimal",
            ].map((name, i) => (
              <Box
                key={name}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "6px",
                  fontFamily: fontFamilies.mono,
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  ...(i === 0
                    ? { bgcolor: "accent.primary", color: "#fff" }
                    : {
                        border: `1px solid ${line.border}`,
                        color: "text.secondary",
                      }),
                }}
              >
                {name}
              </Box>
            ))}
          </Stack>

          {/* Preview area */}
          <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                width: "100%",
                maxWidth: 600,
                aspectRatio: "1200/630",
                borderRadius: `${radii.md}px`,
                overflow: "hidden",
                position: "relative",
                background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)",
                }}
              />
              <Stack
                sx={{
                  position: "relative",
                  height: "100%",
                  justifyContent: "flex-end",
                  p: { xs: 2.5, sm: 4 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: fontFamilies.mono,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    mb: 1,
                  }}
                >
                  my-blog.com
                </Typography>
                <Typography
                  sx={{
                    fontFamily: fontFamilies.display,
                    fontSize: { xs: 18, sm: 24 },
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  Building with Bun: A Practical Guide
                </Typography>
                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
                  Why we migrated our API from Node to Bun and what we learned along the way.
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
