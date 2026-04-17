import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { isImageKind, type ImageKind } from "@ogstack/shared";
import { Playground } from "@/components/features/playground";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";

interface PlaygroundPageProps {
  searchParams: Promise<{ kind?: string; url?: string; template?: string }>;
}

function defaultTemplateForKind(kind: ImageKind): string {
  return kind === "icon_set" ? "icon_default" : "editorial";
}

export default async function PlaygroundPage(props: PlaygroundPageProps): Promise<ReactElement> {
  const client = await getServerClient();
  const params = await props.searchParams;

  const initialKind: ImageKind = isImageKind(params.kind) ? params.kind : "og";
  const initialUrl = params.url ?? "";
  const initialTemplate = params.template ?? defaultTemplateForKind(initialKind);

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
      <Playground
        key={initialKind}
        initialProjects={projectsRes.data}
        initialTemplates={templatesRes.data}
        initialKind={initialKind}
        initialUrl={initialUrl}
        initialTemplate={initialTemplate}
      />
    </Stack>
  );
}
