import type { client } from "@/lib/api";
import type { Data } from "./utils";

export type ProjectListResponse = Data<(typeof client)["api"]["projects"]["get"]>;
export type Project = ProjectListResponse["items"][number];
