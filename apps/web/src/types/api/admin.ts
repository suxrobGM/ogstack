import type { client } from "@/lib/api/client";
import type { Data } from "./utils";

type AdminUserById = ReturnType<(typeof client)["api"]["admin"]["users"]>;
type AdminImageById = ReturnType<(typeof client)["api"]["admin"]["images"]>;

export type AdminStats = Data<(typeof client)["api"]["admin"]["stats"]["get"]>;

export type AdminUserListResponse = Data<(typeof client)["api"]["admin"]["users"]["get"]>;
export type AdminUserListItem = AdminUserListResponse["items"][number];

export type AdminUserDetail = Data<AdminUserById["get"]>;

export type AdminImageListResponse = Data<(typeof client)["api"]["admin"]["images"]["get"]>;
export type AdminImageItem = AdminImageListResponse["items"][number];

export type AdminUserPlanResponse = Data<AdminUserById["plan"]["patch"]>;
export type AdminUserSuspendResponse = Data<AdminUserById["suspend"]["post"]>;
export type AdminImageDeleteResponse = Data<AdminImageById["delete"]>;
