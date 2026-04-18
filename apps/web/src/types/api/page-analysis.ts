import type { client } from "@/lib/api/client";
import type { Data } from "./utils";

export type AnalyzeRequestBody = Parameters<(typeof client)["api"]["analyses"]["post"]>[0];

export type PageAnalysisResponse = Data<(typeof client)["api"]["analyses"]["post"]>;
