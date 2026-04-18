import type { ReactElement } from "react";
import { ApiKeyList } from "@/components/features/api-keys/api-key-list";
import { getServerClient } from "@/lib/api/server";

export default async function ApiKeysPage(): Promise<ReactElement> {
  const client = await getServerClient();

  const [projectsRes, keysRes] = await Promise.all([
    client.api.projects.get({ query: { page: 1, limit: 100 } }),
    client.api.keys.get({ query: {} }),
  ]);

  return <ApiKeyList projects={projectsRes.data?.items ?? []} initialData={keysRes.data ?? null} />;
}
