import type { ReactElement } from "react";
import { getApiKeys, getProjects } from "@/api/queries";
import { ApiKeyList } from "@/components/features/api-keys/api-key-list";

export default async function ApiKeysPage(): Promise<ReactElement> {
  const [projectsData, keys] = await Promise.all([
    getProjects({ page: 1, limit: 100 }),
    getApiKeys(),
  ]);

  return <ApiKeyList projects={projectsData?.items ?? []} data={keys ?? null} />;
}
