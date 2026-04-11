"use client";

import type { ReactElement } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api";
import type { PlanResponse, SubscriptionResponse, UsageStatsResponse } from "@/types/api";
import { PlanCard } from "./plan-card";
import { SubscriptionStatus } from "./subscription-status";
import { UsageQuotas } from "./usage-quotas";

interface BillingContentProps {
  initialPlans: PlanResponse[];
  initialSubscription: SubscriptionResponse | null;
  initialUsage: UsageStatsResponse;
}

export function BillingContent(props: BillingContentProps): ReactElement {
  const { initialPlans, initialSubscription, initialUsage } = props;

  const { data: plans } = useApiQuery(["billing", "plans"], () => client.api.billing.plans.get(), {
    initialData: initialPlans,
  });

  const { data: subscription } = useApiQuery(
    ["billing", "subscription"],
    () => client.api.billing.subscription.get(),
    { initialData: initialSubscription },
  );

  const { data: usage } = useApiQuery(["usage"], () => client.api.usage.stats.get(), {
    initialData: initialUsage,
  });

  const checkoutMutation = useApiMutation(
    (priceId: string) => client.api.billing.checkout.post({ priceId }),
    {
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      errorMessage: "Failed to create checkout session",
    },
  );

  const currentPlanKey = subscription?.planKey ?? usage?.plan ?? "FREE";

  return (
    <Stack spacing={5}>
      <SubscriptionStatus subscription={subscription ?? null} />

      {usage && <UsageQuotas usage={usage} />}

      <Stack spacing={2}>
        <Typography variant="overlineMuted">Available Plans</Typography>
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {(plans ?? []).map((plan) => (
            <Grid key={plan.id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <PlanCard
                plan={plan}
                currentPlanKey={currentPlanKey}
                onSelect={(priceId) => checkoutMutation.mutate(priceId)}
                isLoading={checkoutMutation.isPending}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}
