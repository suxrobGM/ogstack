import type { ReactElement } from "react";
import CheckIcon from "@mui/icons-material/Check";
import {
  Box,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { PLAN_CONFIGS, PLANS, UNLIMITED_QUOTA } from "@ogstack/shared";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { line } from "@/theme/palette";
import { iconSizes } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ["5 templates", "GET meta tag mode", "Community support", "Watermark on images"],
  PRO: [
    "All templates",
    "Brand Kit",
    "AI backgrounds (Flux Schnell)",
    "No watermark",
    "Priority support",
  ],
  BUSINESS: [
    "Everything in Pro",
    "A/B testing",
    "Analytics dashboard",
    "AI backgrounds (Flux Pro)",
    "Team access",
  ],
  ENTERPRISE: [
    "Everything in Business",
    "Custom domain",
    "SLA guarantee",
    "SSO",
    "All AI models",
    "Dedicated support",
  ],
};

export default function PricingPage(): ReactElement {
  return (
    <Box sx={{ bgcolor: "surfaces.base", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant="overline"
          sx={{ color: "accent.primary", display: "block", textAlign: "center", mb: 2 }}
        >
          Pricing
        </Typography>
        <Typography variant="h1" sx={{ textAlign: "center", mb: 2 }}>
          Simple, transparent pricing
        </Typography>
        <Typography
          variant="body1Muted"
          sx={{ textAlign: "center", mb: 8, maxWidth: 520, mx: "auto" }}
        >
          Start free. Scale as you grow. No surprise charges. All plans include our core OG image
          generation engine.
        </Typography>
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {PLANS.map((key) => {
            const config = PLAN_CONFIGS[key];
            const features = PLAN_FEATURES[key] ?? [];
            const isHighlighted = key === "PRO";
            const quotaLabel =
              config.quota === UNLIMITED_QUOTA
                ? "Unlimited images"
                : `${config.quota.toLocaleString()} images/mo`;

            return (
              <Grid key={key} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Surface
                  variant={isHighlighted ? "expressive" : "quiet"}
                  padding={4}
                  sx={{ height: "100%", display: "flex", flexDirection: "column" }}
                >
                  <Typography variant="overline" sx={{ color: "text.disabled" }}>
                    {config.name}
                  </Typography>
                  <Stack direction="row" sx={{ alignItems: "baseline", mt: 1, mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontFamily: fontFamilies.mono,
                        fontSize: "2.5rem",
                        fontWeight: 600,
                        lineHeight: 1,
                      }}
                    >
                      ${config.price}
                    </Typography>
                    <Typography variant="body2Muted" sx={{ ml: 0.5 }}>
                      {config.price === 0 ? "forever" : "/month"}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "accent.secondary", mb: 3 }}>
                    {quotaLabel}
                  </Typography>
                  <List dense sx={{ flex: 1, py: 0 }}>
                    {features.map((feature) => (
                      <ListItem key={feature} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 28, color: "success.main" }}>
                          <CheckIcon sx={{ fontSize: iconSizes.xs }} />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    href={ROUTES.register}
                    variant={isHighlighted ? "contained" : "outlined"}
                    fullWidth
                    sx={{ mt: 3 }}
                  >
                    {config.price === 0 ? "Get started" : "Start free trial"}
                  </Button>
                </Surface>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 8, pt: 6, borderTop: `1px solid ${line.divider}` }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Need a custom plan?
          </Typography>
          <Typography variant="body1Muted" sx={{ mb: 3, maxWidth: 480, mx: "auto" }}>
            For high-volume or enterprise requirements, contact us for custom pricing and SLA
            agreements.
          </Typography>
          <Button variant="outlined" href="mailto:sales@ogstack.dev">
            Contact Sales
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
