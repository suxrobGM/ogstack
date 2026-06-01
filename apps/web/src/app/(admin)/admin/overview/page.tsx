import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { AdminOverview } from "@/components/features/admin";
import { getAdminStats } from "@/lib/api/queries";

export default async function AdminOverviewPage(): Promise<ReactElement> {
  const data = await getAdminStats();
  if (!data) notFound();
  return <AdminOverview stats={data} />;
}
