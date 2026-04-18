"use client";

import { useState, type ReactElement } from "react";
import { Grid } from "@mui/material";
import { ERROR_CODES, type ImageKind } from "@ogstack/shared";
import { useForm } from "@tanstack/react-form";
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
import { buildPlaygroundSnippet } from "@/utils/integration-snippet";
import { ControlsPanel } from "./controls-panel";
import { OutputPanel } from "./output-panel";
import { OverrideDialog } from "./override-dialog";
import { PageContentPanel } from "./page-content-panel";
import { PreviewPane } from "./preview-pane";
import { playgroundFormSchema, type PlaygroundFormValues } from "./schema";
import { UsageMeter } from "./usage-meter";

const DEFAULTS: PlaygroundFormValues = {
  url: "",
  kind: "og",
  template: "editorial",
  aspectRatio: "16:9",
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
  customPrompt?: string;
  mode: "classic" | "ai" | "override";
}

interface PlaygroundProps {
  initialProjects: ProjectListResponse | null;
  initialTemplates: TemplateInfo[] | null;
  initialKind: ImageKind;
  initialUrl: string;
  initialTemplate: string;
}

/** Serialize only the params that differ from backend defaults, so the meta
 *  tag stays as short as possible in the customer's HTML. */
function toOgParams(values: PlaygroundFormValues): URLSearchParams {
  const params = new URLSearchParams();
  params.set("url", values.url);
  if (values.template !== "editorial") params.set("template", values.template);
  if (values.accent !== "#3B82F6") params.set("accent", values.accent);
  if (!values.dark) params.set("dark", "false");
  if (values.font !== "inter") params.set("font", values.font);
  if (values.logoUrl) params.set("logoUrl", values.logoUrl);
  if (values.logoPosition !== "top-left") params.set("logoPosition", values.logoPosition);
  if (values.aiGenerated) {
    params.set("ai", "true");
    if (values.aiModel !== "standard") params.set("aiModel", values.aiModel);
  }
  if (values.aiPrompt) params.set("aiPrompt", values.aiPrompt);
  return params;
}

export function Playground(props: PlaygroundProps): ReactElement {
  const { initialProjects, initialTemplates, initialKind, initialUrl, initialTemplate } = props;

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
    client.api.analyses.post(variables),
  );

  const submit = (values: PlaygroundFormValues, force: boolean) => {
    setLastFormValues(values);
    setAnalyzed(true);

    // Icon set is always AI and ignores template/styling options.
    const aiEnabled = values.kind === "icon_set" ? true : values.aiGenerated;

    if (values.url && !values.fullOverride) {
      analyzeMutation.mutate({
        url: values.url,
        customPrompt: values.aiPrompt,
        mode: aiEnabled ? "ai" : "classic",
      });
    }

    generateMutation.mutate({
      url: values.url,
      kind: values.kind,
      template: values.kind === "icon_set" ? undefined : values.template,
      projectId: selectedProjectId,
      force,
      style: {
        accent: values.accent,
        dark: values.dark,
        font: values.font,
        logo: values.logoUrl ? { url: values.logoUrl, position: values.logoPosition } : undefined,
        aspectRatio: values.kind === "blog_hero" ? values.aspectRatio : undefined,
      },
      ai: aiEnabled
        ? {
            model: values.aiModel,
            prompt: values.aiPrompt,
            override: values.fullOverride,
          }
        : undefined,
    });
  };

  const confirmOverride = () => {
    setOverridePrompt(false);
    if (lastFormValues) submit(lastFormValues, true);
  };

  const form = useForm({
    defaultValues: {
      ...DEFAULTS,
      kind: initialKind,
      template: initialTemplate,
      url: initialUrl,
    } as PlaygroundFormValues,
    validators: {
      onBlur: playgroundFormSchema,
      onSubmit: playgroundFormSchema,
    },
    onSubmit: ({ value }) => submit(value, false),
  });

  const handleRegenerate = () => {
    submit(form.state.values, true);
  };

  const integration =
    result && lastFormValues
      ? buildPlaygroundSnippet({
          kind: lastFormValues.kind,
          result,
          publicProjectId: selectedProject?.publicId ?? null,
          ogParams: toOgParams(lastFormValues),
        })
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
          <OutputPanel result={result} integration={integration} />
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
