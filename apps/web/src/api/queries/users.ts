import { getServerClient } from "@/api/server";

export async function getCurrentUser() {
  const client = await getServerClient();
  const { data } = await client.api.users.me.get();
  return data;
}
