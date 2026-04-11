import type { client } from "@/lib/api/client";
import type { Data } from "./utils";

export type UserProfile = Data<(typeof client)["api"]["users"]["me"]["get"]>;
