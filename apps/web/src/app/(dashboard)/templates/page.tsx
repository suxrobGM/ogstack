import type { ReactElement } from "react";
import { TemplateGallery } from "@/components/features/templates/template-gallery";
import { getProjects, getTemplates } from "@/lib/api/queries";

export default async function TemplatesPage(): Promise<ReactElement> {
  const [templates, projectsData] = await Promise.all([
    getTemplates(),
    getProjects({ page: 1, limit: 100 }),
  ]);

  return <TemplateGallery templates={templates ?? []} projects={projectsData?.items ?? []} />;
}
