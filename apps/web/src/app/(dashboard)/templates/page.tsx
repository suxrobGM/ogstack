import type { ReactElement } from "react";
import { TemplateGallery } from "@/components/features/templates/template-gallery";
import { getServerClient } from "@/lib/api/server";

export default async function TemplatesPage(): Promise<ReactElement> {
  const client = await getServerClient();
  const [templatesRes, projectsRes] = await Promise.all([
    client.api.templates.get(),
    client.api.projects.get({ query: { page: 1, limit: 100 } }),
  ]);

  return (
    <TemplateGallery
      initialTemplates={templatesRes.data ?? []}
      projects={projectsRes.data?.items ?? []}
    />
  );
}
