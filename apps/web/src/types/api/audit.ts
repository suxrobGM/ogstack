import type { client } from "@/lib/api/client";
import type { Data } from "./utils";

export type AuditCreateBody = Parameters<(typeof client)["api"]["audit"]["post"]>[0];
export type AuditReportResponse = Data<(typeof client)["api"]["audit"]["post"]>;
export type AuditIssue = AuditReportResponse["issues"][number];
export type AuditPreviewMetadata = AuditReportResponse["metadata"];
export type AuditCategoryScores = AuditReportResponse["categoryScores"];

export type AuditHistoryResponse = Data<(typeof client)["api"]["audit"]["history"]["get"]>;
export type AuditHistoryItem = AuditHistoryResponse["items"][number];
