import type { ReactElement } from "react";
import { Container } from "@mui/material";
import { Plan } from "@ogstack/shared";
import { notFound } from "next/navigation";
import { AuditReport } from "@/components/features/audit";
import type { AuditViewer } from "@/components/features/audit/ai-recommendations";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAuditReportPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const client = await getServerClient();

  const [reportRes, userRes] = await Promise.all([
    client.api.audits({ id }).get(),
    client.api.users.me.get(),
  ]);

  if (reportRes.error || !reportRes.data) {
    notFound();
  }

  const report = reportRes.data;
  const viewer: AuditViewer = !userRes.data
    ? "anonymous"
    : userRes.data.plan === Plan.FREE
      ? "free"
      : "pro";

  return (
    <>
      <PageHeader
        title={`Score: ${report.overallScore} · Grade ${report.letterGrade}`}
        description={report.url}
      />

      <AuditReport report={report} viewer={viewer} />
    </>
  );
}
