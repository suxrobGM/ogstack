import { getServerClient } from "@/lib/api/server";

export async function getApiKeys(projectId?: string) {
  const client = await getServerClient();
  const { data } = await client.api.keys.get({ query: { projectId } });
  return data;
}
