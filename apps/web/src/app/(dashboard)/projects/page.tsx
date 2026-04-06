import type { ReactElement } from "react";
import { ProjectList } from "@/components/features/projects/project-list";
import { getServerClient } from "@/lib/api-server";

export default async function ProjectsPage(): Promise<ReactElement> {
  const client = await getServerClient();
  const { data } = await client.api.projects.get({ query: { page: 1, limit: 10 } });

  return <ProjectList initialData={data} />;
}
