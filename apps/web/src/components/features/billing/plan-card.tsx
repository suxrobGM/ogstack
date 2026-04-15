"use client";

import type { ReactElement } from "react";
import CheckIcon from "@mui/icons-material/Check";
import {
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Plan } from "@ogstack/shared";
import { Surface } from "@/components/ui/layout/surface";
import { fontFamilies, iconSizes } from "@/theme";
import type { PlanResponse } from "@/types/api";

interface PlanCardProps {
  plan: PlanResponse;
  currentPlanKey: string;
  onSelect: (priceId: string) => void;
  isLoading?: boolean;
}

export function PlanCard(props: PlanCardProps): ReactElement {
  const { plan, currentPlanKey, onSelect, isLoading } = props;

  const isCurrentPlan = plan.key === currentPlanKey;
  const tierOrder: string[] = [Plan.FREE, Plan.PLUS, Plan.PRO];
  const currentSortOrder = tierOrder.indexOf(currentPlanKey);
  const planSortOrder = tierOrder.indexOf(plan.key);
  const isUpgrade = planSortOrder > currentSortOrder;
  const isDowngrade = planSortOrder < currentSortOrder;

  const quotaLabel = "Unlimited images";

  return (
    <Surface
      variant={isCurrentPlan ? "expressive" : "quiet"}
      padding={4}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="overline" sx={{ color: "text.disabled" }}>
          {plan.name}
        </Typography>
        {isCurrentPlan && <Chip label="Current" size="small" color="success" />}
      </Stack>
      <Stack direction="row" sx={{ alignItems: "baseline", mt: 1, mb: 0.5 }}>
        <Typography
          sx={{
            fontFamily: fontFamilies.mono,
            fontSize: "2.5rem",
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          ${plan.price}
        </Typography>
        <Typography variant="body2Muted" sx={{ ml: 0.5 }}>
          {plan.price === 0 ? "forever" : "/month"}
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ color: "accent.secondary", mb: 3 }}>
        {quotaLabel}
      </Typography>
      <List dense sx={{ flex: 1, py: 0 }}>
        {plan.features.map((feature) => (
          <ListItem key={feature} disableGutters sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 28, color: "success.main" }}>
              <CheckIcon sx={{ fontSize: iconSizes.xs }} />
            </ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>
      {isCurrentPlan ? (
        <Button variant="outlined" fullWidth disabled sx={{ mt: 3 }}>
          Current Plan
        </Button>
      ) : plan.key === "FREE" ? (
        <Button variant="outlined" fullWidth disabled sx={{ mt: 3 }}>
          Free
        </Button>
      ) : (
        <Button
          variant={isUpgrade ? "contained" : "outlined"}
          fullWidth
          sx={{ mt: 3 }}
          onClick={() => plan.stripePriceId && onSelect(plan.stripePriceId)}
          disabled={isLoading || !plan.stripePriceId}
        >
          {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Select"}
        </Button>
      )}
    </Surface>
  );
}
