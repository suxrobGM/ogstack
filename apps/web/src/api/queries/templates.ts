import { getServerClient } from "@/api/server";

export async function getTemplates() {
  const client = await getServerClient();
  const { data } = await client.api.templates.get();
  return data;
}
