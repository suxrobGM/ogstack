import type { SearchableQuery } from "@ogstack/shared";
import { getServerClient } from "@/api/server";

export async function getAdminStats() {
  const client = await getServerClient();
  const { data } = await client.api.admin.stats.get();
  return data;
}

export async function getAdminUsers(params?: SearchableQuery) {
  const client = await getServerClient();
  const { data } = await client.api.admin.users.get({
    query: { page: params?.page ?? 1, limit: params?.limit ?? 20, search: params?.search },
  });
  return data;
}

export async function getAdminUser(id: string) {
  const client = await getServerClient();
  const { data } = await client.api.admin.users({ id }).get();
  return data;
}

export async function getAdminImages(
  params?: SearchableQuery & { userId?: string; projectId?: string },
) {
  const client = await getServerClient();
  const { data } = await client.api.admin.images.get({
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      userId: params?.userId,
      projectId: params?.projectId,
    },
  });
  return data;
}
