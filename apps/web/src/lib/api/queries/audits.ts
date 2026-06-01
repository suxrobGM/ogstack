import type { PaginationQuery } from "@ogstack/shared";
import { getServerClient } from "@/lib/api/server";

export async function getAuditHistory(params?: PaginationQuery) {
  const client = await getServerClient();
  const { data } = await client.api.audits.history.get({
    query: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
  });
  return data;
}

export async function getAudit(id: string, options?: { auth?: boolean }) {
  const client = await getServerClient({ auth: options?.auth ?? true });
  const { data } = await client.api.audits({ id }).get();
  return data;
}
