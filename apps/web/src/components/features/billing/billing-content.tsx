"use client";

import { useState, type ReactElement } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { PlanResponse, SubscriptionResponse, UsageStatsResponse } from "@/types/api";
import { DowngradeDialog } from "./downgrade-dialog";
import { PlanCard } from "./plan-card";
import { PromoCodeInput } from "./promo-code-input";
import { SubscriptionStatus } from "./subscription-status";
import { UsageQuotas } from "./usage-quotas";

type DowngradeTarget = "FREE" | "PLUS";

interface BillingContentProps {
  initialPlans: PlanResponse[];
  initialSubscription: SubscriptionResponse | null;
  initialUsage: UsageStatsResponse;
}

export function BillingContent(props: BillingContentProps): ReactElement {
  const { initialPlans, initialSubscription, initialUsage } = props;

  const [promoCode, setPromoCode] = useState("");
  const [pendingDowngrade, setPendingDowngrade] = useState<DowngradeTarget | null>(null);

  const { data: plans } = useApiQuery(
    queryKeys.billing.plans(),
    () => client.api.billing.plans.get(),
    { initialData: initialPlans },
  );

  const { data: subscription } = useApiQuery(
    queryKeys.billing.subscription(),
    () => client.api.billing.subscription.get(),
    { initialData: initialSubscription },
  );

  const { data: usage } = useApiQuery(queryKeys.usage.all, () => client.api.usage.stats.get(), {
    initialData: initialUsage,
  });

  const checkoutMutation = useApiMutation(
    (priceId: string) =>
      client.api.billing.checkout.post({
        priceId,
        ...(promoCode ? { promotionCode: promoCode } : {}),
      }),
    {
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      errorMessage: "Failed to create checkout session",
    },
  );

  const downgradeMutation = useApiMutation(
    (targetPlan: DowngradeTarget) => client.api.billing.downgrade.post({ targetPlan }),
    {
      successMessage: "Downgrade scheduled for end of current billing period.",
      invalidateKeys: [queryKeys.billing.subscription()],
      onSuccess: () => setPendingDowngrade(null),
      errorMessage: "Failed to schedule downgrade",
    },
  );

  const currentPlanKey = subscription?.planKey ?? usage?.plan ?? "FREE";
  const currentPlan = plans?.find((p) => p.key === currentPlanKey);
  const targetPlan = pendingDowngrade ? plans?.find((p) => p.key === pendingDowngrade) : undefined;

  return (
    <Stack spacing={5}>
      <SubscriptionStatus subscription={subscription ?? null} />

      {usage && <UsageQuotas usage={usage} />}

      <Stack spacing={2}>
        <Typography variant="overlineMuted">Promotion code</Typography>
        <PromoCodeInput
          value={promoCode}
          onChange={setPromoCode}
          onClear={() => setPromoCode("")}
          disabled={checkoutMutation.isPending}
        />
      </Stack>

      <Stack spacing={2}>
        <Typography variant="overlineMuted">Available Plans</Typography>
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {(plans ?? []).map((plan) => (
            <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
              <PlanCard
                plan={plan}
                currentPlanKey={currentPlanKey}
                onUpgrade={(priceId) => checkoutMutation.mutate(priceId)}
                onDowngrade={(target) => setPendingDowngrade(target)}
                isLoading={checkoutMutation.isPending || downgradeMutation.isPending}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>

      <DowngradeDialog
        open={!!pendingDowngrade}
        targetPlanName={targetPlan?.name ?? pendingDowngrade ?? ""}
        currentPlanName={currentPlan?.name ?? currentPlanKey}
        isLoading={downgradeMutation.isPending}
        onConfirm={() => pendingDowngrade && downgradeMutation.mutate(pendingDowngrade)}
        onClose={() => setPendingDowngrade(null)}
      />
    </Stack>
  );
}
