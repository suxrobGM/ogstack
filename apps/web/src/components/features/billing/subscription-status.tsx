"use client";

import type { ReactElement } from "react";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useApiMutation, useConfirm } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { fontFamilies } from "@/theme";
import type { SubscriptionResponse } from "@/types/api";
import { formatDate } from "@/utils/formatters";

interface SubscriptionStatusProps {
  subscription: SubscriptionResponse | null;
}

function getStatusChip(subscription: SubscriptionResponse): ReactElement {
  if (subscription.isComp) {
    return <Chip label="Complimentary" size="small" color="info" />;
  }
  if (subscription.cancelAtPeriodEnd) {
    return <Chip label="Canceling" size="small" color="warning" />;
  }
  switch (subscription.status) {
    case "active":
      return <Chip label="Active" size="small" color="success" />;
    case "past_due":
      return <Chip label="Past Due" size="small" color="error" />;
    case "trialing":
      return <Chip label="Trial" size="small" color="info" />;
    case "canceled":
      return <Chip label="Canceled" size="small" color="default" />;
    default:
      return <Chip label={subscription.status} size="small" />;
  }
}

export function SubscriptionStatus(props: SubscriptionStatusProps): ReactElement {
  const { subscription } = props;
  const confirm = useConfirm();

  const cancelMutation = useApiMutation(() => client.api.billing.cancel.post(), {
    successMessage: "Subscription will cancel at end of billing period",
    invalidateKeys: [queryKeys.billing.subscription()],
  });

  const resumeMutation = useApiMutation(() => client.api.billing.resume.post(), {
    successMessage: "Subscription resumed",
    invalidateKeys: [queryKeys.billing.subscription()],
  });

  const portalMutation = useApiMutation(() => client.api.billing.portal.post(), {
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
  });

  if (!subscription) {
    return (
      <Box>
        <Typography variant="body2Muted">
          You are on the Free plan. Upgrade to unlock more features.
        </Typography>
      </Box>
    );
  }

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Cancel subscription",
      description: `Your subscription will remain active until ${formatDate(subscription.currentPeriodEnd)}. After that, you'll be downgraded to the Free plan.`,
      confirmLabel: "Cancel subscription",
      destructive: true,
    });
    if (confirmed) cancelMutation.mutate();
  };

  const handleResume = async () => {
    const confirmed = await confirm({
      title: "Resume subscription",
      description: "Your subscription will continue and you won't be downgraded.",
      confirmLabel: "Resume",
    });
    if (confirmed) resumeMutation.mutate();
  };

  return (
    <Box>
      <Typography variant="overlineMuted" sx={{ mb: 2, display: "block" }}>
        Subscription
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
          <Typography
            sx={{
              fontFamily: fontFamilies.mono,
              fontSize: "1.25rem",
              fontWeight: 500,
            }}
          >
            {subscription.planName}
          </Typography>
          {getStatusChip(subscription)}
        </Stack>

        {subscription.cancelAtPeriodEnd && (
          <Alert severity="warning" variant="outlined">
            Your subscription will cancel on {formatDate(subscription.currentPeriodEnd)}. You'll
            keep access until then.
          </Alert>
        )}

        {subscription.status === "past_due" && (
          <Alert severity="error" variant="outlined">
            Your last payment failed. Please update your payment method to avoid service
            interruption.
          </Alert>
        )}

        {!subscription.isComp && subscription.status !== "canceled" && (
          <Typography variant="body2Muted">
            Next billing date: {formatDate(subscription.currentPeriodEnd)}
          </Typography>
        )}

        <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap" }}>
          {!subscription.isComp && subscription.status !== "canceled" && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
            >
              Manage Payment
            </Button>
          )}

          {subscription.cancelAtPeriodEnd && !subscription.isComp && (
            <Button
              variant="contained"
              size="small"
              onClick={handleResume}
              disabled={resumeMutation.isPending}
            >
              Resume Subscription
            </Button>
          )}

          {!subscription.cancelAtPeriodEnd &&
            !subscription.isComp &&
            subscription.status === "active" && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                Cancel Subscription
              </Button>
            )}
        </Stack>
      </Stack>
    </Box>
  );
}
