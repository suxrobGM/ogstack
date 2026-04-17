import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { Playground } from "@/components/features/playground";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";

export default async function PlaygroundPage(): Promise<ReactElement> {
  const client = await getServerClient();

  const [projectsRes, templatesRes] = await Promise.all([
    client.api.projects.get({ query: { page: 1, limit: 100 } }),
    client.api.templates.get(),
  ]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Playground"
        description="Preview and customize OG images, blog heroes, and favicon sets for any URL."
      />
      <Playground initialProjects={projectsRes.data} initialTemplates={templatesRes.data} />
    </Stack>
  );
}
