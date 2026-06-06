import type { client } from "@/api/client";
import type { Data } from "./utils";

export type UserProfile = Data<(typeof client)["api"]["users"]["me"]["get"]>;
