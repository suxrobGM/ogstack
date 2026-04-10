import type { ReactElement } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ROUTES } from "@/lib/constants";
import { aubergine } from "@/theme/palette";
import { gradients, noise } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";

export function HeroSection(): ReactElement {
  return (
    <Box
      sx={{
        pt: { xs: 14, md: 22 },
        pb: { xs: 12, md: 18 },
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: gradients.mesh,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: noise.grain,
          opacity: 0.04,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: "accent.sunset",
            mb: 4,
            display: "inline-block",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 1,
            px: 2,
            py: 0.75,
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(16,185,129,0.06)",
          }}
        >
          Developer-first OG image platform
        </Typography>
        <Typography
          variant="h1"
          sx={{
            backgroundImage: gradients.heroText,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
            display: "block",
          }}
        >
          Beautiful social previews. Zero effort.
        </Typography>
        <Typography
          variant="body1Muted"
          sx={{ maxWidth: 520, mx: "auto", mb: 6, fontSize: "1.125rem", lineHeight: 1.7 }}
        >
          A single meta tag or API call produces contextual social preview images for any URL. No
          design tools, no templates to maintain, no effort required.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center", mb: 8 }}>
          <Button href={ROUTES.register} variant="contained" size="large">
            Get started free
          </Button>
          <Button href={ROUTES.docs} variant="outlined" size="large">
            Read the docs
          </Button>
        </Stack>
        <Box
          sx={{
            maxWidth: 560,
            mx: "auto",
            backgroundColor: aubergine.surface,
            border: "1px solid rgba(250,250,250,0.08)",
            borderRadius: 2,
            p: 2.5,
            textAlign: "left",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 24,
              right: 24,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)",
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", display: "block", mb: 1, textTransform: "uppercase" }}
          >
            Drop this into your &lt;head&gt;
          </Typography>
          <Typography
            component="code"
            sx={{
              fontFamily: fontFamilies.mono,
              fontSize: "0.8rem",
              color: "text.secondary",
              lineHeight: 1.6,
              wordBreak: "break-all",
              "& .tag": { color: "#10b981" },
              "& .attr": { color: "#22d3ee" },
              "& .val": { color: "#a1a1aa" },
            }}
          >
            <Box component="span" className="tag">
              &lt;meta{" "}
            </Box>
            <Box component="span" className="attr">
              property
            </Box>
            =
            <Box component="span" className="val">
              &quot;og:image&quot;
            </Box>
            <br />
            {"  "}
            <Box component="span" className="attr">
              content
            </Box>
            =
            <Box component="span" className="val">
              &quot;https://api.ogstack.dev/og/your-id?url=...&quot;
            </Box>
            <Box component="span" className="tag">
              {" "}
              /&gt;
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
