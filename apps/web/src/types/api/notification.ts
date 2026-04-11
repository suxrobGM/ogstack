import type { client } from "@/lib/api";
import type { Data } from "./utils";

export type NotificationsDto = Data<(typeof client)["api"]["notifications"]["get"]>["items"];
