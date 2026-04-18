"use client";

import type { ReactElement } from "react";
import { useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import type { PageAuditReportResponse } from "@/types/api";
import { InsightsView } from "./insights-view";
import { LockedPreview } from "./locked-preview";
import { EmptyProView, FailedView, PendingView } from "./status-views";

export type AuditViewer = "anonymous" | "free" | "pro";

interface AiRecommendationsPanelProps {
  report: PageAuditReportResponse;
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
    () => client.api.audits({ id: report.id }).get(),
    {
      initialData: report,
      refetchInterval: (q) => (q.state.data?.ai?.status === "PENDING" ? 2000 : false),
      enabled: report.ai?.status === "PENDING",
    },
  );

  const current = data ?? report;

  switch (current.ai?.status) {
    case "READY":
      return current.ai.analysis ? (
        <InsightsView insights={current.ai.analysis} />
      ) : (
        <FailedView error={null} />
      );
    case "PENDING":
      return <PendingView />;
    case "FAILED":
      return <FailedView error={current.ai.error} />;
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
