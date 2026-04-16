"use client";

import type { ReactElement } from "react";
import { useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import type { AuditReportResponse } from "@/types/api";
import { InsightsView } from "./insights-view";
import { LockedPreview } from "./locked-preview";
import { EmptyProView, FailedView, PendingView } from "./status-views";

export type AuditViewer = "anonymous" | "free" | "pro";

interface AiRecommendationsPanelProps {
  report: AuditReportResponse;
  /**
   * Who's looking at this report. Determines the empty/locked state shown
   * when there's no AI analysis on the record.
   */
  viewer: AuditViewer;
}

export function AiRecommendationsPanel(props: AiRecommendationsPanelProps): ReactElement {
  const { report, viewer } = props;

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
      if (viewer === "anonymous") {
        return <LockedPreview audience="anonymous" />;
      }
      if (viewer === "free") {
        return <LockedPreview audience="free" />;
      }
      return <EmptyProView />;
    }
  }
}
