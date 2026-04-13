import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { AuditReport } from "@/components/features/audit";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAuditReportPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const client = await getServerClient();
  const { data, error } = await client.api.audit({ id }).get();
  if (error || !data) notFound();

  const report = data;
  return (
    <>
      <PageHeader
        title={`Score: ${report.overallScore} · Grade ${report.letterGrade}`}
        description={report.url}
      />
      <AuditReport report={report} />
    </>
  );
}
