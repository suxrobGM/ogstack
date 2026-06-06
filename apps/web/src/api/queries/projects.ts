import type { SearchableQuery } from "@ogstack/shared";
import { getServerClient } from "@/api/server";

export async function getProjects(params?: SearchableQuery) {
  const client = await getServerClient();
  const { data } = await client.api.projects.get({
    query: { page: params?.page ?? 1, limit: params?.limit ?? 10, search: params?.search },
  });
  return data;
}

export async function getProject(id: string) {
  const client = await getServerClient();
  const { data } = await client.api.projects({ id }).get();
  return data;
}
