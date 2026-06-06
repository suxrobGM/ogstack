import { getServerClient } from "@/api/server";

interface DateRange {
  from?: Date;
  to?: Date;
}

export async function getUsageStats(range?: DateRange) {
  const client = await getServerClient();
  const { data } = await client.api.usage.stats.get({ query: range ?? {} });
  return data;
}

export async function getUsageDaily(range: DateRange) {
  const client = await getServerClient();
  const { data } = await client.api.usage.daily.get({ query: range });
  return data;
}

export async function getUsageHistory(range: DateRange) {
  const client = await getServerClient();
  const { data } = await client.api.usage.history.get({ query: range });
  return data;
}
