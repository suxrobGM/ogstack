import type { ReactElement } from "react";
import { AdminUserList } from "@/components/features/admin";
import { getAdminUsers } from "@/lib/api/queries";

export default async function AdminUsersPage(): Promise<ReactElement> {
  const data = await getAdminUsers({ page: 1, limit: 20 });
  return <AdminUserList data={data} />;
}
