import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { ProjectApiKeys } from "@/components/features/projects/project-api-keys";
import { getServerClient } from "@/lib/api/server";
import { ROUTES } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectApiKeysPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const client = await getServerClient();
  const { data: project } = await client.api.projects({ id }).get();

  if (!project) {
    redirect(ROUTES.projects);
  }

  const { data: apiKeys } = await client.api.projects({ id })["api-keys"].get();

  return <ProjectApiKeys projectId={project.id} initialApiKeys={apiKeys ?? []} />;
}
