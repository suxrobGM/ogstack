import type { client } from "@/lib/api/client";
import type { Body, Data } from "./utils";

export type PageAuditCreateBody = Body<(typeof client)["api"]["audits"]["post"]>;
export type PageAuditReportResponse = Data<(typeof client)["api"]["audits"]["post"]>;
export type PageAuditIssue = PageAuditReportResponse["issues"][number];
export type PageAuditPreviewMetadata = PageAuditReportResponse["metadata"];
export type PageAuditCategoryScores = PageAuditReportResponse["categoryScores"];

export type PageAuditHistoryResponse = Data<(typeof client)["api"]["audits"]["history"]["get"]>;
export type PageAuditHistoryItem = PageAuditHistoryResponse["items"][number];
