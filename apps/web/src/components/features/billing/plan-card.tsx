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

type DowngradeTarget = "FREE" | "PLUS";

interface PlanCardProps {
  plan: PlanResponse;
  currentPlanKey: string;
  onUpgrade: (priceId: string) => void;
  onDowngrade: (target: DowngradeTarget) => void;
  isLoading?: boolean;
}

const TIER_ORDER: string[] = [Plan.FREE, Plan.PLUS, Plan.PRO];

export function PlanCard(props: PlanCardProps): ReactElement {
  const { plan, currentPlanKey, onUpgrade, onDowngrade, isLoading } = props;

  const isCurrentPlan = plan.key === currentPlanKey;
  const currentSortOrder = TIER_ORDER.indexOf(currentPlanKey);
  const planSortOrder = TIER_ORDER.indexOf(plan.key);
  const isUpgrade = planSortOrder > currentSortOrder;
  const isDowngrade = planSortOrder < currentSortOrder;

  const handleClick = () => {
    if (isUpgrade && plan.stripePriceId) {
      onUpgrade(plan.stripePriceId);
      return;
    }
    if (isDowngrade && (plan.key === Plan.FREE || plan.key === Plan.PLUS)) {
      onDowngrade(plan.key);
    }
  };

  const buttonLabel = isCurrentPlan
    ? "Current Plan"
    : isUpgrade
      ? `Upgrade to ${plan.name}`
      : `Downgrade to ${plan.name}`;

  const disabled = isCurrentPlan || isLoading || (isUpgrade && !plan.stripePriceId);

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
      <Stack direction="row" sx={{ alignItems: "baseline", mt: 1, mb: 3 }}>
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
      <Button
        variant={isUpgrade || isCurrentPlan ? "contained" : "outlined"}
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleClick}
        disabled={disabled}
      >
        {buttonLabel}
      </Button>
    </Surface>
  );
}
