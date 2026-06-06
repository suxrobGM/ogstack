import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { isImageKind, type ImageKind } from "@ogstack/shared";
import { getProjects, getTemplates } from "@/api/queries";
import { Playground } from "@/components/features/playground";
import { PageHeader } from "@/components/ui/layout/page-header";

interface PlaygroundPageProps {
  searchParams: Promise<{ kind?: string; url?: string; template?: string }>;
}

function defaultTemplateForKind(kind: ImageKind): string {
  return kind === "icon_set" ? "icon_default" : "editorial";
}

export default async function PlaygroundPage(props: PlaygroundPageProps): Promise<ReactElement> {
  const params = await props.searchParams;

  const initialKind: ImageKind = isImageKind(params.kind) ? params.kind : "og";
  const initialUrl = params.url ?? "";
  const initialTemplate = params.template ?? defaultTemplateForKind(initialKind);

  const [projectsData, templates] = await Promise.all([
    getProjects({ page: 1, limit: 100 }),
    getTemplates(),
  ]);

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <PageHeader
        title="Playground"
        description="Preview and customize OG images, blog heroes, and favicon sets for any URL."
      />
      <Playground
        key={initialKind}
        projects={projectsData}
        templates={templates}
        kind={initialKind}
        url={initialUrl}
        template={initialTemplate}
      />
    </Stack>
  );
}
