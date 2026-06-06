import type { SearchableQuery } from "@ogstack/shared";
import { getServerClient } from "@/api/server";

export async function getImages(params?: SearchableQuery & { projectId?: string }) {
  const client = await getServerClient();
  const { data } = await client.api.images.get({
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 24,
      search: params?.search,
      projectId: params?.projectId,
    },
  });
  return data;
}

export async function getImage(id: string) {
  const client = await getServerClient();
  const { data } = await client.api.images({ id }).get();
  return data;
}
