import type { ReactElement } from "react";
import { getProjects, getTemplates } from "@/api/queries";
import { TemplateGallery } from "@/components/features/templates/template-gallery";

export default async function TemplatesPage(): Promise<ReactElement> {
  const [templates, projectsData] = await Promise.all([
    getTemplates(),
    getProjects({ page: 1, limit: 100 }),
  ]);

  return <TemplateGallery templates={templates ?? []} projects={projectsData?.items ?? []} />;
}
