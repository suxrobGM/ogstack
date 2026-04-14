import type { ReactElement, ReactNode } from "react";
import { Stack } from "@mui/material";
import { redirect } from "next/navigation";
import { ProjectTabs } from "@/components/features/projects/project-tabs";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";
import { ROUTES } from "@/lib/constants";

interface ProjectLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout(props: ProjectLayoutProps): Promise<ReactElement> {
  const { children, params } = props;
  const { id } = await params;
  const client = await getServerClient();
  const { data: project } = await client.api.projects({ id }).get();

  if (!project) {
    redirect(ROUTES.projects);
  }

  return (
    <Stack spacing={4}>
      <PageHeader title={project.name} description={`Public ID: ${project.publicId}`} />
      <ProjectTabs projectId={project.id} />
      {children}
    </Stack>
  );
}
