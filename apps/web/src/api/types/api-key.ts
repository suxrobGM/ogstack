import type { client } from "@/api/client";
import type { Data } from "./utils";

export type ApiKeyListResponse = Data<(typeof client)["api"]["keys"]["get"]>;
export type ApiKey = ApiKeyListResponse[number];
export type ApiKeyWithSecret = Data<(typeof client)["api"]["keys"]["post"]>;
