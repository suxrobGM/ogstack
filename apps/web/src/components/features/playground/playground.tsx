"use client";

import { useState, type ReactElement } from "react";
import { Grid } from "@mui/material";
import { ERROR_CODES } from "@ogstack/shared";
import { useForm } from "@tanstack/react-form";
import { useSearchParams } from "next/navigation";
import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type {
  GenerateDto,
  ImageGenerateBody,
  PageAnalysisResponse,
  ProjectListResponse,
  TemplateInfo,
  UsageStatsResponse,
} from "@/types/api";
import { buildOgImageUrl, buildOgMetaTag, OG_PRODUCTION_HOST } from "@/utils/og-image";
import { ControlsPanel } from "./controls-panel";
import { OutputPanel } from "./output-panel";
import { OverrideDialog } from "./override-dialog";
import { PageContentPanel } from "./page-content-panel";
import { PreviewPane } from "./preview-pane";
import type { PlaygroundFormValues } from "./schema";
import { UsageMeter } from "./usage-meter";

const DEFAULTS: PlaygroundFormValues = {
  url: "",
  template: "gradient_dark",
  accent: "#3B82F6",
  dark: true,
  font: "inter",
  logoUrl: "",
  logoPosition: "top-left",
  aiGenerated: false,
  aiModel: "standard",
  aiPrompt: "",
  fullOverride: false,
};

interface AnalyzeVariables {
  url: string;
  userPrompt?: string;
  fullOverride: boolean;
  skipAi: boolean;
}

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
  if (values.aiGenerated) params.set("aiGenerated", "true");
  if (values.aiPrompt) params.set("aiPrompt", values.aiPrompt);
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
  const [analyzed, setAnalyzed] = useState(false);
  const [overridePrompt, setOverridePrompt] = useState(false);

  const { data: templatesData } = useApiQuery<TemplateInfo[]>(
    queryKeys.templates.list(),
    () => client.api.templates.get(),
    { initialData: initialTemplates! },
  );

  const templates = templatesData ?? [];
  const projects = initialProjects?.items ?? [];
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const { data: usageStats, refetch: refetchUsage } = useApiQuery<UsageStatsResponse>(
    queryKeys.usage.stats(),
    () => client.api.usage.stats.get({ query: {} }),
  );

  const generateMutation = useApiMutation(
    (body: ImageGenerateBody) => client.api.images.post(body),
    {
      onSuccess: (data) => {
        setResult(data);
        refetchUsage();
      },
      onError: (err) => {
        if (err.value?.code === ERROR_CODES.IMAGE_EXISTS) {
          setOverridePrompt(true);
          return;
        }
      },
    },
  );

  const analyzeMutation = useApiMutation<PageAnalysisResponse, AnalyzeVariables>((variables) =>
    client.api["page-analysis"].analyze.post(variables),
  );

  const submit = (values: PlaygroundFormValues, force: boolean, override = false) => {
    setLastFormValues(values);
    setAnalyzed(true);

    if (values.url.trim() && !values.fullOverride) {
      analyzeMutation.mutate({
        url: values.url,
        userPrompt: values.aiPrompt,
        fullOverride: values.fullOverride,
        skipAi: !values.aiGenerated,
      });
    }

    generateMutation.mutate({
      url: values.url,
      template: values.template,
      projectId: selectedProjectId,
      override,
      options: {
        accent: values.accent,
        dark: values.dark,
        font: values.font,
        logoUrl: values.logoUrl || undefined,
        logoPosition: values.logoPosition,
        aiGenerated: values.aiGenerated,
        aiModel: values.aiGenerated ? values.aiModel : undefined,
        aiPrompt: values.aiPrompt,
        fullOverride: values.fullOverride,
        force: force,
      },
    });
  };

  const confirmOverride = (): void => {
    setOverridePrompt(false);
    if (lastFormValues) submit(lastFormValues, false, true);
  };

  const form = useForm({
    defaultValues: { ...DEFAULTS, template: initialTemplate, url: initialUrl },
    onSubmit: ({ value }) => submit(value, false),
  });

  const handleRegenerate = () => {
    submit(form.state.values, true, true);
  };

  const metaTag =
    result && lastFormValues && selectedProject
      ? buildOgMetaTag(
          buildOgImageUrl(selectedProject.publicId, toOgParams(lastFormValues), OG_PRODUCTION_HOST),
        )
      : null;

  return (
    <Grid container spacing={3}>
      {usageStats && (
        <Grid size={{ xs: 12 }}>
          <UsageMeter stats={usageStats} />
        </Grid>
      )}

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
        <PreviewPane
          result={result}
          isGenerating={generateMutation.isPending}
          onRegenerate={handleRegenerate}
        />
      </Grid>

      {analyzed && (
        <Grid size={{ xs: 12 }}>
          <PageContentPanel
            data={analyzeMutation.data}
            isLoading={analyzeMutation.isPending}
            isError={analyzeMutation.isError}
            onApplyAccent={(hex) => form.setFieldValue("accent", hex)}
          />
        </Grid>
      )}

      {result && (
        <Grid size={{ xs: 12 }}>
          <OutputPanel result={result} metaTag={metaTag} />
        </Grid>
      )}

      <OverrideDialog
        open={overridePrompt}
        isLoading={generateMutation.isPending}
        onConfirm={confirmOverride}
        onClose={() => setOverridePrompt(false)}
      />
    </Grid>
  );
}
