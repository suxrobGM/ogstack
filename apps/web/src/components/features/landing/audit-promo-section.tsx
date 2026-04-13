import type { ReactElement } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { iconSizes } from "@/theme";
import { fontFamilies } from "@/theme/typography";

const HIGHLIGHTS = [
  "24 checks across Open Graph, Twitter card, and SEO hygiene",
  "Live previews for X, Facebook, LinkedIn, Instagram, Slack, Telegram, Discord",
  "Concrete fix recommendations for every failing check",
  "Free, no signup — shareable report URL",
];

export function AuditPromoSection(): ReactElement {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Surface variant="expressive" sx={{ overflow: "hidden" }}>
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <VerifiedIcon sx={{ color: "accent.primary", fontSize: iconSizes.sm }} />
                  <Typography
                    variant="overline"
                    sx={{ color: "accent.primary", letterSpacing: "0.12em" }}
                  >
                    Free audit tool
                  </Typography>
                </Stack>
                <Typography variant="h2" sx={{ maxWidth: 520 }}>
                  Is your URL ready to be shared?
                </Typography>
                <Typography variant="body1Muted" sx={{ maxWidth: 520 }}>
                  Paste any URL and get an A–F grade in seconds. See exactly how it previews on
                  every major platform, and get a line-by-line fix list for anything that&apos;s
                  missing.
                </Typography>
                <Stack component="ul" spacing={1.25} sx={{ pl: 0, m: 0, listStyle: "none" }}>
                  {HIGHLIGHTS.map((item) => (
                    <Stack
                      key={item}
                      component="li"
                      direction="row"
                      spacing={1.25}
                      sx={{ alignItems: "flex-start" }}
                    >
                      <CheckCircleIcon
                        sx={{ color: "success.main", fontSize: 18, mt: "2px", flexShrink: 0 }}
                      />
                      <Typography variant="body2">{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1 }}>
                  <Button
                    href={ROUTES.audit}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Audit a URL — free
                  </Button>
                  <Button href={ROUTES.register} variant="outlined" size="large">
                    Create account
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <ScoreMockup />
            </Grid>
          </Grid>
        </Surface>
      </Container>
    </Box>
  );
}

function ScoreMockup(): ReactElement {
  const score = 87;
  const grade = "B";
  const size = 220;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <Stack sx={{ alignItems: "center" }} spacing={2}>
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            color="#2563EB"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <Stack
          sx={{
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: fontFamilies.mono,
              fontSize: size * 0.3,
              fontWeight: 600,
              lineHeight: 1,
              color: "#2563EB",
            }}
          >
            {score}
          </Typography>
          <Typography variant="captionMuted" sx={{ mt: 0.5 }}>
            out of 100
          </Typography>
        </Stack>
      </Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
        <Typography variant="overlineMuted">Grade</Typography>
        <Typography
          sx={{
            fontFamily: fontFamilies.mono,
            fontSize: "2rem",
            fontWeight: 600,
            color: "#2563EB",
            lineHeight: 1,
          }}
        >
          {grade}
        </Typography>
      </Stack>
    </Stack>
  );
}
