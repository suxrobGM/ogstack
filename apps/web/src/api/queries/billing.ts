import { getServerClient } from "@/api/server";

export async function getBillingPlans() {
  const client = await getServerClient();
  const { data } = await client.api.billing.plans.get();
  return data;
}

export async function getSubscription() {
  const client = await getServerClient();
  const { data } = await client.api.billing.subscription.get();
  return data;
}
