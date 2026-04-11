import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { Plan } from "@ogstack/shared";
import { BillingContent } from "@/components/features/billing";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";

export default async function BillingPage(): Promise<ReactElement> {
  const client = await getServerClient();

  const [plansRes, subscriptionRes, usageRes] = await Promise.all([
    client.api.billing.plans.get(),
    client.api.billing.subscription.get(),
    client.api.usage.stats.get(),
  ]);

  const plans = plansRes.data ?? [];
  const subscription = subscriptionRes.data ?? null;
  const usage = usageRes.data ?? {
    period: "",
    plan: Plan.FREE,
    quota: 50,
    used: 0,
    remaining: 50,
    aiImageCount: 0,
    cacheHits: 0,
  };

  return (
    <Stack spacing={4}>
      <PageHeader title="Billing" description="Manage your subscription and billing." />
      <BillingContent
        initialPlans={plans}
        initialSubscription={subscription}
        initialUsage={usage}
      />
    </Stack>
  );
}
