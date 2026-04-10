import type { ReactElement } from "react";
import CheckIcon from "@mui/icons-material/Check";
import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { line } from "@/theme/palette";
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
    <Box sx={{ py: { xs: 10, md: 14 }, borderTop: `1px solid ${line.divider}` }}>
      <Container maxWidth="lg">
        <Typography
          variant="overline"
          sx={{ color: "accent.sunset", display: "block", textAlign: "center", mb: 2 }}
        >
          Pricing
        </Typography>
        <Typography variant="h2" sx={{ textAlign: "center", mb: 2 }}>
          Simple, transparent pricing
        </Typography>
        <Typography
          variant="body1Muted"
          sx={{ textAlign: "center", mb: 8, maxWidth: 480, mx: "auto" }}
        >
          Start free. Scale as you grow. No surprise charges.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          {TIERS.map((tier) => (
            <Surface
              key={tier.name}
              variant={tier.highlighted ? "expressive" : "quiet"}
              padding={4}
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography variant="overline" sx={{ color: "text.disabled" }}>
                {tier.name}
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
                  {tier.price}
                </Typography>
                <Typography variant="body2Muted" sx={{ ml: 0.5 }}>
                  {tier.period}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: "accent.amber", mb: 3 }}>
                {tier.quota}
              </Typography>
              <List dense sx={{ flex: 1, py: 0 }}>
                {tier.features.map((feature) => (
                  <ListItem key={feature} disableGutters sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: "success.main" }}>
                      <CheckIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
              <Button
                href={ROUTES.register}
                variant={tier.highlighted ? "contained" : "outlined"}
                fullWidth
                sx={{ mt: 3 }}
              >
                {tier.cta}
              </Button>
            </Surface>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
