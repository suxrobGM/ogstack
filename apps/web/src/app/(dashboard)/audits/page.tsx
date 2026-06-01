import type { ReactElement } from "react";
import { AuditDashboard } from "@/components/features/audit/form";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getAuditHistory } from "@/lib/api/queries";
import type { PageAuditHistoryResponse } from "@/types/api";

const EMPTY_HISTORY: PageAuditHistoryResponse = {
  items: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

export default async function DashboardAuditPage(): Promise<ReactElement> {
  const history = (await getAuditHistory({ page: 1, limit: 20 })) ?? EMPTY_HISTORY;
  return (
    <>
      <PageHeader
        title="Audits"
        description="Grade your pages' OG and SEO readiness, and see platform previews."
      />
      <AuditDashboard history={history} />
    </>
  );
}
