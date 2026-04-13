"use client";

import { useState, type ReactElement } from "react";
import { Grid } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useSearchParams } from "next/navigation";
import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type {
  GenerateDto,
  ImageGenerateBody,
  ProjectListResponse,
  TemplateInfo,
} from "@/types/api";
import { buildOgImageUrl, buildOgMetaTag, OG_PRODUCTION_HOST } from "@/utils/og-image";
import { ControlsPanel } from "./controls-panel";
import { PreviewPane } from "./preview-pane";
import type { PlaygroundFormValues } from "./schema";

const DEFAULTS: PlaygroundFormValues = {
  url: "",
  template: "gradient_dark",
  accent: "#3B82F6",
  dark: true,
  font: "inter",
  logoUrl: "",
  logoPosition: "top-left",
};

interface PlaygroundProps {
  initialProjects: ProjectListResponse | null;
  initialTemplates: TemplateInfo[] | null;
}

/** Serialize only the params that differ from backend defaults, so the meta
 *  tag stays as short as possible in the customer's HTML. */
function toOgParams(values: PlaygroundFormValues): URLSearchParams {
  const params = new URLSearchParams();
  params.set("url", values.url);
  if (values.template !== "gradient_dark") params.set("template", values.template);
  if (values.accent !== "#3B82F6") params.set("accent", values.accent);
  if (!values.dark) params.set("dark", "false");
  if (values.font !== "inter") params.set("font", values.font);
  if (values.logoUrl) params.set("logoUrl", values.logoUrl);
  if (values.logoPosition !== "top-left") params.set("logoPosition", values.logoPosition);
  return params;
}

export function Playground(props: PlaygroundProps): ReactElement {
  const { initialProjects, initialTemplates } = props;
  const searchParams = useSearchParams();
  const initialTemplate =
    (searchParams.get("template") as PlaygroundFormValues["template"] | null) ?? DEFAULTS.template;

  const initialUrl = searchParams.get("url") ?? DEFAULTS.url;

  const [selectedProjectId, setSelectedProjectId] = useState(
    () => initialProjects?.items[0]?.id ?? "",
  );
  const [result, setResult] = useState<GenerateDto | null>(null);
  const [lastFormValues, setLastFormValues] = useState<PlaygroundFormValues | null>(null);

  const { data: templatesData } = useApiQuery<TemplateInfo[]>(
    queryKeys.templates.list(),
    () => client.api.templates.get(),
    { initialData: initialTemplates! },
  );

  const templates = templatesData ?? [];
  const projects = initialProjects?.items ?? [];
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const generateMutation = useApiMutation(
    (body: ImageGenerateBody) => client.api.images.post(body),
    {
      // Backend supplies user-friendly messages (see apps/api/src/common/errors
      // and scraper.service.ts); surface them directly.
      errorMessage: (err) => err.message,
      onSuccess: (data) => {
        setResult(data as GenerateDto);
      },
    },
  );

  const form = useForm({
    defaultValues: { ...DEFAULTS, template: initialTemplate, url: initialUrl },
    onSubmit: ({ value }) => {
      setLastFormValues(value);
      generateMutation.mutate({
        url: value.url,
        template: value.template,
        projectId: selectedProjectId,
        options: {
          accent: value.accent,
          dark: value.dark,
          font: value.font,
          logoUrl: value.logoUrl,
          logoPosition: value.logoPosition,
        },
      });
    },
  });

  const metaTag =
    result && lastFormValues && selectedProject
      ? buildOgMetaTag(
          buildOgImageUrl(selectedProject.publicId, toOgParams(lastFormValues), OG_PRODUCTION_HOST),
        )
      : null;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <ControlsPanel
          form={form}
          templates={templates}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          isGenerating={generateMutation.isPending}
          onGenerate={() => form.handleSubmit()}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <PreviewPane result={result} isGenerating={generateMutation.isPending} metaTag={metaTag} />
      </Grid>
    </Grid>
  );
}
