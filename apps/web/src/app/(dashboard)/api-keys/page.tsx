import type { ReactElement } from "react";
import { ApiKeyList } from "@/components/features/api-keys/api-key-list";
import { getApiKeys, getProjects } from "@/lib/api/queries";

export default async function ApiKeysPage(): Promise<ReactElement> {
  const [projectsData, keys] = await Promise.all([
    getProjects({ page: 1, limit: 100 }),
    getApiKeys(),
  ]);

  return <ApiKeyList projects={projectsData?.items ?? []} data={keys ?? null} />;
}
