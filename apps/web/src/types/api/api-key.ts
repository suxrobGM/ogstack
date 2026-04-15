import type { client } from "@/lib/api/client";
import type { Data } from "./utils";

export type ApiKeyListResponse = Data<(typeof client)["api"]["api-keys"]["get"]>;
export type ApiKey = ApiKeyListResponse[number];
export type ApiKeyCreated = Data<(typeof client)["api"]["api-keys"]["post"]>;
