import type { client } from "@/api/client";
import type { Data } from "./utils";

export type NotificationsDto = Data<(typeof client)["api"]["notifications"]["get"]>["items"];
