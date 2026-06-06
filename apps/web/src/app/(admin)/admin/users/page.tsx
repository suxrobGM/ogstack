import type { ReactElement } from "react";
import { getAdminUsers } from "@/api/queries";
import { AdminUserList } from "@/components/features/admin";

export default async function AdminUsersPage(): Promise<ReactElement> {
  const data = await getAdminUsers({ page: 1, limit: 20 });
  return <AdminUserList data={data} />;
}
