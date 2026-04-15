import type { ReactElement } from "react";
import { AuditDashboard } from "@/components/features/audit/form";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";
import type { AuditHistoryResponse } from "@/types/api";

async function fetchHistory(): Promise<AuditHistoryResponse> {
  const client = await getServerClient();
  const { data } = await client.api.audit.history.get({ query: { page: 1, limit: 20 } });
  return (
    data ?? {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  );
}

export default async function DashboardAuditPage(): Promise<ReactElement> {
  const history = await fetchHistory();
  return (
    <>
      <PageHeader
        title="Audits"
        description="Grade your pages' OG and SEO readiness, and see platform previews."
      />
      <AuditDashboard initialHistory={history} />
    </>
  );
}
