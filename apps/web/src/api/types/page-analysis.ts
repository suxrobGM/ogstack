import type { client } from "@/api/client";
import type { Body, Data } from "./utils";

export type AnalyzeRequestBody = Body<(typeof client)["api"]["analyses"]["post"]>;

export type PageAnalysisResponse = Data<(typeof client)["api"]["analyses"]["post"]>;
