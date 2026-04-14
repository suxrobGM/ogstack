import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { ProjectSettings } from "@/components/features/projects/project-settings";
import { getServerClient } from "@/lib/api/server";
import { ROUTES } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectSettingsPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const client = await getServerClient();
  const { data: project } = await client.api.projects({ id }).get();

  if (!project) {
    redirect(ROUTES.projects);
  }

  return <ProjectSettings project={project} />;
}
