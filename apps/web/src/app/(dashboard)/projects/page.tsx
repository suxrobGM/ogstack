import type { ReactElement } from "react";
import { getProjects } from "@/api/queries";
import { ProjectList } from "@/components/features/projects/project-list";

export default async function ProjectsPage(): Promise<ReactElement> {
  const data = await getProjects({ page: 1, limit: 10 });

  return <ProjectList data={data} />;
}
