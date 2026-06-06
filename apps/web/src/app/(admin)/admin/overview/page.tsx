import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getAdminStats } from "@/api/queries";
import { AdminOverview } from "@/components/features/admin";

export default async function AdminOverviewPage(): Promise<ReactElement> {
  const data = await getAdminStats();
  if (!data) notFound();
  return <AdminOverview stats={data} />;
}
