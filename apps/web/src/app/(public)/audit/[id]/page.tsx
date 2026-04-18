import type { ReactElement } from "react";
import { Container } from "@mui/material";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuditReport } from "@/components/features/audit";
import { getServerClient } from "@/lib/api/server";
import type { PageAuditReportResponse } from "@/types/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchReport(id: string): Promise<PageAuditReportResponse | null> {
  const client = await getServerClient({ auth: false });
  const { data, error } = await client.api.audits({ id }).get();
  if (error || !data) return null;
  return data;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const report = await fetchReport(id);
  if (!report) return { title: "Audit not found · OGStack" };
  return {
    title: `${report.overallScore}/100 — Audit for ${report.url} · OGStack`,
    description: `OG + SEO audit. Grade ${report.letterGrade}. ${report.issues.filter((i) => !i.pass).length} issues found.`,
  };
}

export default async function PublicAuditReportPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const report = await fetchReport(id);

  if (!report) {
    notFound();
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <AuditReport report={report} viewer="anonymous" />
    </Container>
  );
}
