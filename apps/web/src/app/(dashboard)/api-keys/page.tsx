import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/api-server";
import { ApiKeysFeature } from "@/components/features/api-keys/api-keys-feature";

export default async function ApiKeysPage(): Promise<ReactElement> {
  const client = await getServerClient({ auth: true });
  const { data: user } = await client.api.users.me.get();

  if (!user) {
    redirect("/login");
  }

  return <ApiKeysFeature />;
}
