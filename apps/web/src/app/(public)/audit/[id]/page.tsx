import type { ReactElement } from "react";
import { Container } from "@mui/material";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuditReport } from "@/components/features/audit";
import { getServerClient } from "@/lib/api/server";
import type { AuditReportResponse } from "@/types/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchReport(id: string): Promise<AuditReportResponse | null> {
  const client = await getServerClient({ auth: false });
  const { data, error } = await client.api.audit({ id }).get();
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
  if (!report) notFound();

  return <AuditReport report={report} />;
}
