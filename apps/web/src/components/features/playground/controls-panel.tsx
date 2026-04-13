"use client";

import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import { FormTextField } from "@/components/ui/form/form-text-field";
import type { AnyReactForm } from "@/components/ui/form/types";
import { Surface } from "@/components/ui/layout/surface";
import type { Project, TemplateInfo } from "@/types/api";
import { normalizeUrlInput } from "@/utils/url";
import {
  AiGenerationField,
  GenerateButton,
  ProjectSelect,
  StylingFields,
  TemplateField,
} from "./controls";

interface ControlsPanelProps {
  form: AnyReactForm;
  templates: TemplateInfo[];
  projects: Pick<Project, "id" | "name">[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function ControlsPanel(props: ControlsPanelProps): ReactElement {
  const {
    form,
    templates,
    projects,
    selectedProjectId,
    onProjectChange,
    isGenerating,
    onGenerate,
  } = props;

  return (
    <Surface sx={{ height: "100%" }}>
      <Stack spacing={3}>
        <ProjectSelect
          projects={projects}
          selectedProjectId={selectedProjectId}
          onChange={onProjectChange}
        />

        <FormTextField
          form={form}
          name="url"
          label="URL"
          placeholder="https://example.com/page"
          transform={normalizeUrlInput}
        />

        <AiGenerationField form={form} />

        <form.Subscribe
          selector={(s: { values: { aiGenerated: boolean } }) => s.values.aiGenerated}
        >
          {(aiGenerated: boolean) =>
            aiGenerated ? (
              <Typography variant="captionMuted">
                AI mode generates the full image from page content. Template and styling options are
                not used.
              </Typography>
            ) : (
              <Stack spacing={3}>
                <TemplateField form={form} templates={templates} />
                <StylingFields form={form} />
              </Stack>
            )
          }
        </form.Subscribe>

        <GenerateButton isGenerating={isGenerating} onClick={onGenerate} />
      </Stack>
    </Surface>
  );
}
