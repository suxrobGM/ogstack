import type { ReactElement } from "react";
import { SecurityContent } from "@/components/features/settings/security-content";
import { getServerClient } from "@/lib/api-server";

export default async function SecurityPage(): Promise<ReactElement> {
  const client = await getServerClient();
  const { data: user } = await client.api.users.me.get();

  return <SecurityContent initialUser={user!} />;
}
