import type { client } from "@/lib/api/client";
import type { Data } from "./utils";

export type NotificationsDto = Data<(typeof client)["api"]["notifications"]["get"]>["items"];
