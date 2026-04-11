import type { client } from "@/lib/api/client";
import type { Data } from "./utils";

export type PlansResponse = Data<(typeof client)["api"]["billing"]["plans"]["get"]>;
export type PlanResponse = PlansResponse[number];

export type SubscriptionResponse = Data<(typeof client)["api"]["billing"]["subscription"]["get"]>;
export type UsageStatsResponse = Data<(typeof client)["api"]["usage"]["stats"]["get"]>;
