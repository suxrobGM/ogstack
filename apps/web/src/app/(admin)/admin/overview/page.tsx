import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { AdminOverview } from "@/components/features/admin";
import { getServerClient } from "@/lib/api/server";

export default async function AdminOverviewPage(): Promise<ReactElement> {
  const client = await getServerClient();
  const { data } = await client.api.admin.stats.get();
  if (!data) notFound();
  return <AdminOverview stats={data} />;
}
