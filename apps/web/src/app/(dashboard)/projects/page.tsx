import type { ReactElement } from "react";
import { ProjectList } from "@/components/features/projects/project-list";
import { getProjects } from "@/lib/api/queries";

export default async function ProjectsPage(): Promise<ReactElement> {
  const data = await getProjects({ page: 1, limit: 10 });

  return <ProjectList data={data} />;
}
