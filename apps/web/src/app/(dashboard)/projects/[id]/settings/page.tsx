import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { ProjectSettings } from "@/components/features/projects/project-settings";
import { getProject } from "@/lib/api/queries";
import { ROUTES } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectSettingsPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const project = await getProject(id);

  if (!project) {
    redirect(ROUTES.projects);
  }

  return <ProjectSettings project={project} />;
}
