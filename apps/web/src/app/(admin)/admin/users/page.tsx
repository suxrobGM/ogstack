import type { ReactElement } from "react";
import { AdminUserList } from "@/components/features/admin";
import { getServerClient } from "@/lib/api/server";

export default async function AdminUsersPage(): Promise<ReactElement> {
  const client = await getServerClient();
  const { data } = await client.api.admin.users.get({ query: { page: 1, limit: 20 } });
  return <AdminUserList initialData={data} />;
}
