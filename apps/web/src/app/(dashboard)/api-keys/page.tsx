import type { ReactElement } from "react";
import { ApiKeyList } from "@/components/features/api-keys/api-key-list";
import { getServerClient } from "@/lib/api/server";

export default async function ApiKeysPage(): Promise<ReactElement> {
  const client = await getServerClient();

  const { data: projects } = await client.api.projects.get({ query: { page: 1, limit: 100 } });
  const projectItems = projects?.items ?? [];
  const firstProject = projectItems[0];

  let initialKeys = null;
  if (firstProject) {
    const { data } = await client.api.projects({ id: firstProject.id })["api-keys"].get();
    initialKeys = data;
  }

  return (
    <ApiKeyList
      projects={projectItems}
      initialProjectId={firstProject?.id}
      initialData={initialKeys}
    />
  );
}
