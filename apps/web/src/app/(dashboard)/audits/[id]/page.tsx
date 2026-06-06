import type { ReactElement } from "react";
import { Container } from "@mui/material";
import { notFound } from "next/navigation";
import { getAudit, getCurrentUser } from "@/api/queries";
import { AuditReport } from "@/components/features/audit";
import type { AuditViewer } from "@/components/features/audit/ai-recommendations";
import { PageHeader } from "@/components/ui/layout/page-header";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAuditReportPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;

  const [report, user] = await Promise.all([getAudit(id), getCurrentUser()]);

  if (!report) {
    notFound();
  }

  const viewer: AuditViewer = user ? "authenticated" : "anonymous";

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
