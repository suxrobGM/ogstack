import type { ReactElement } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Plan, PLAN_CONFIGS, PLANS, UNLIMITED, type PlanConfig } from "@ogstack/shared";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { iconSizes } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";

interface Feature {
  label: string;
  included: boolean;
}

function describeProjects(config: PlanConfig): string {
  if (config.projectLimit === UNLIMITED) return "Unlimited projects";
  return `${config.projectLimit} project${config.projectLimit === 1 ? "" : "s"}`;
}

function describeDomains(config: PlanConfig): string {
  if (config.domainsPerProject === UNLIMITED) return "Unlimited domains per project";
  return `${config.domainsPerProject} domain${config.domainsPerProject === 1 ? "" : "s"} per project`;
}

function buildFeatures(plan: Plan): Feature[] {
  const config = PLAN_CONFIGS[plan];
  return [
    { label: "Unlimited non-AI images", included: true },
    {
      label: `${config.aiImageLimit} AI images / month${plan === Plan.PRO ? " (Pro + standard models)" : " (standard model)"}`,
      included: true,
    },
    {
      label: `${config.aiAuditLimit} AI audit recommendations / month`,
      included: config.aiAuditLimit > 0,
    },
    { label: "All templates", included: true },
    { label: describeProjects(config), included: true },
    { label: describeDomains(config), included: true },
    { label: "No watermark", included: !config.watermark },
    { label: "Priority support", included: config.prioritySupport },
  ];
}

export function PricingSection(): ReactElement {
  return (
    <Box id="pricing" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ textAlign: "center", mb: 1.5 }}>
          Simple, honest pricing
        </Typography>
        <Typography
          variant="body1Muted"
          sx={{ textAlign: "center", mb: 6, maxWidth: 520, mx: "auto" }}
        >
          Start free. Non-AI images (OG + blog hero) are unlimited on every plan — only AI
          generation and audit recommendations are metered.
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: "stretch", justifyContent: "center" }}>
          {PLANS.map((key) => {
            const config = PLAN_CONFIGS[key];
            const features = buildFeatures(key);
            const highlighted = key === Plan.PLUS;
            const cta = config.price === 0 ? "Get started" : `Start with ${config.name}`;

            return (
              <Grid key={key} size={{ xs: 12, md: 4 }}>
                <Surface
                  variant="quiet"
                  padding={3.5}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    ...(highlighted && {
                      borderColor: "accent.primary",
                      boxShadow:
                        "0 2px 8px rgba(44,40,37,0.08), 0 16px 40px rgba(44,40,37,0.06), 0 0 0 1px rgba(180,83,9,0.15)",
                    }),
                  }}
                >
                  <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {config.name}
                    </Typography>
                    {highlighted && <Chip label="Most popular" size="small" color="primary" />}
                  </Stack>
                  <Stack direction="row" sx={{ alignItems: "baseline", mb: 2.5 }}>
                    <Typography
                      sx={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ${config.price}
                    </Typography>
                    <Typography variant="body2Muted" sx={{ ml: 0.5 }}>
                      {config.price === 0 ? "forever" : "/month"}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontFamily: fontFamilies.mono,
                      fontSize: "0.72rem",
                      color: "accent.secondary",
                      mb: 1.5,
                    }}
                  >
                    {config.aiImageLimit} AI images/mo · Unlimited non-AI
                  </Typography>
                  <List dense sx={{ flex: 1, py: 0 }}>
                    {features.map((feature) => (
                      <ListItem key={feature.label} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon
                          sx={{
                            minWidth: 28,
                            color: feature.included ? "success.main" : "text.disabled",
                          }}
                        >
                          {feature.included ? (
                            <CheckIcon sx={{ fontSize: iconSizes.xs }} />
                          ) : (
                            <CloseIcon sx={{ fontSize: iconSizes.xs }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.label}
                          slotProps={{
                            primary: {
                              sx: {
                                fontSize: 14,
                                color: feature.included ? "text.primary" : "text.disabled",
                              },
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    href={ROUTES.pricing}
                    variant={highlighted ? "contained" : "outlined"}
                    fullWidth
                    sx={{ mt: 2.5 }}
                  >
                    {cta}
                  </Button>
                </Surface>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
