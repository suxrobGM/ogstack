import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { Plan } from "@ogstack/shared";
import { getBillingPlans, getSubscription, getUsageStats } from "@/api/queries";
import { BillingContent } from "@/components/features/billing";
import { PageHeader } from "@/components/ui/layout/page-header";

export default async function BillingPage(): Promise<ReactElement> {
  const [plansData, subscriptionData, usageData] = await Promise.all([
    getBillingPlans(),
    getSubscription(),
    getUsageStats(),
  ]);

  const plans = plansData ?? [];
  const subscription = subscriptionData ?? null;
  const usage = usageData ?? {
    period: "",
    plan: Plan.FREE,
    used: 0,
    aiImageCount: 0,
    aiImageLimit: 3,
    aiProImageCount: 0,
    aiProImageLimit: 0,
    aiAuditCount: 0,
    aiAuditLimit: 3,
    cacheHits: 0,
  };

  return (
    <Stack spacing={4}>
      <PageHeader title="Billing" description="Manage your subscription and billing." />
      <BillingContent plans={plans} subscription={subscription} usage={usage} />
    </Stack>
  );
}
