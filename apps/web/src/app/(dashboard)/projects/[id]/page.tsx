import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { redirect } from "next/navigation";
import { ProjectApiKeys } from "@/components/features/projects/project-api-keys";
import { ProjectIntegration } from "@/components/features/projects/project-integration";
import { ProjectSettings } from "@/components/features/projects/project-settings";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";
import { ROUTES } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const client = await getServerClient();

  const { data: project } = await client.api.projects({ id }).get();

  if (!project) {
    redirect(ROUTES.projects);
  }

  const { data: apiKeys } = await client.api.projects({ id })["api-keys"].get();

  return (
    <Stack spacing={4}>
      <PageHeader title={project.name} description={`Public ID: ${project.publicId}`} />
      <ProjectIntegration project={project} />
      <ProjectApiKeys projectId={project.id} initialApiKeys={apiKeys ?? []} />
      <ProjectSettings project={project} />
    </Stack>
  );
}
