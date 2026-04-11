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
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { iconSizes } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    quota: "50 images/mo",
    features: ["5 templates", "GET meta tag mode", "Community support", "Watermark on images"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    quota: "500 images/mo",
    features: [
      "All templates",
      "Brand Kit",
      "AI backgrounds (Flux Schnell)",
      "No watermark",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    quota: "5,000 images/mo",
    features: [
      "Everything in Pro",
      "A/B testing",
      "Analytics dashboard",
      "AI backgrounds (Flux Pro)",
      "Team access",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$79",
    period: "/month",
    quota: "Unlimited images",
    features: [
      "Everything in Business",
      "Custom domain",
      "SLA guarantee",
      "SSO",
      "All AI models",
      "Dedicated support",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export function PricingSection(): ReactElement {
  return (
    <Box id="pricing" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ textAlign: "center", mb: 1.5 }}>
          Simple, honest pricing
        </Typography>
        <Typography
          variant="body1Muted"
          sx={{ textAlign: "center", mb: 6, maxWidth: 400, mx: "auto" }}
        >
          Start free. Upgrade when you need more.
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
          {TIERS.map((tier) => (
            <Grid key={tier.name} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Surface
                variant="quiet"
                padding={3.5}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  ...(tier.highlighted && {
                    borderColor: "accent.primary",
                    boxShadow:
                      "0 2px 8px rgba(44,40,37,0.08), 0 16px 40px rgba(44,40,37,0.06), 0 0 0 1px rgba(180,83,9,0.15)",
                  }),
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    mb: 1,
                  }}
                >
                  {tier.name}
                </Typography>
                <Stack direction="row" sx={{ alignItems: "baseline", mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: "2.25rem",
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {tier.price}
                  </Typography>
                  <Typography variant="body2Muted" sx={{ ml: 0.5 }}>
                    {tier.period}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    fontFamily: fontFamilies.mono,
                    fontSize: "0.72rem",
                    color: "accent.secondary",
                    mb: 2.5,
                  }}
                >
                  {tier.quota}
                </Typography>
                <List dense sx={{ flex: 1, py: 0 }}>
                  {tier.features.map((feature) => (
                    <ListItem key={feature} disableGutters sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28, color: "success.main" }}>
                        <CheckIcon sx={{ fontSize: iconSizes.xs }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        slotProps={{ primary: { sx: { fontSize: 14 } } }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  href={ROUTES.pricing}
                  variant={tier.highlighted ? "contained" : "outlined"}
                  fullWidth
                  sx={{ mt: 2.5 }}
                >
                  {tier.cta}
                </Button>
              </Surface>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
