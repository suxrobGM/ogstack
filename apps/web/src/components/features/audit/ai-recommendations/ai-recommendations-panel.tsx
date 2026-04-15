"use client";

import type { ReactElement } from "react";
import { Plan } from "@ogstack/shared";
import { useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import type { AuditReportResponse } from "@/types/api";
import { InsightsView } from "./insights-view";
import { LockedPreview } from "./locked-preview";
import { EmptyProView, FailedView, PendingView } from "./status-views";

interface AiRecommendationsPanelProps {
  report: AuditReportResponse;
}

export function AiRecommendationsPanel(props: AiRecommendationsPanelProps): ReactElement {
  const { report } = props;
  const { user } = useAuth();

  const { data } = useApiQuery(
    ["audit", "detail", report.id],
    () => client.api.audit({ id: report.id }).get(),
    {
      initialData: report,
      refetchInterval: (q) => (q.state.data?.aiStatus === "PENDING" ? 2000 : false),
      enabled: report.aiStatus === "PENDING",
    },
  );

  const current = data ?? report;

  switch (current.aiStatus) {
    case "READY":
      return current.aiAnalysis ? (
        <InsightsView insights={current.aiAnalysis} />
      ) : (
        <FailedView error={null} />
      );
    case "PENDING":
      return <PendingView />;
    case "FAILED":
      return <FailedView error={current.aiError} />;
    default: {
      if (!user) {
        return <LockedPreview audience="anonymous" />;
      }
      if (user.plan === Plan.FREE) {
        return <LockedPreview audience="free" />;
      }
      return <EmptyProView />;
    }
  }
}
