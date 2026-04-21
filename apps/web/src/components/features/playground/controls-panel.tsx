"use client";

import type { ReactElement } from "react";
import { Alert, Stack, Typography } from "@mui/material";
import {
  BLOG_HERO_ASPECTS,
  hostMatchesDomain,
  isValidHttpUrl,
  type ImageKind,
} from "@ogstack/shared";
import { FormSelectField } from "@/components/ui/form/form-select-field";
import { FormTextField } from "@/components/ui/form/form-text-field";
import type { AnyReactForm } from "@/components/ui/form/types";
import { Surface } from "@/components/ui/layout/surface";
import type { Project, TemplateInfo } from "@/types/api";
import { normalizeUrlInput } from "@/utils/url";
import {
  AiGenerationField,
  AiPromptOverrideFields,
  GenerateButton,
  KindSwitcher,
  ProjectSelect,
  StylingFields,
  TemplateField,
} from "./controls";
import { BLOG_HERO_ASPECT_LABELS } from "./schema";

const ASPECT_RATIO_ITEMS = BLOG_HERO_ASPECTS.map((value) => ({
  value,
  label: BLOG_HERO_ASPECT_LABELS[value],
}));

interface ControlsPanelProps {
  form: AnyReactForm;
  templates: TemplateInfo[];
  projects: Pick<Project, "id" | "name" | "domains">[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

function getMismatchedHostname(url: string, domains: string[]): string | null {
  if (domains.length === 0 || !isValidHttpUrl(url)) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    const matches = domains.some((d) => hostMatchesDomain(host, d));
    return matches ? null : host;
  } catch {
    return null;
  }
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

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <Surface sx={{ height: "100%" }}>
      <Stack spacing={3}>
        <KindSwitcher form={form} />

        <ProjectSelect
          projects={projects}
          selectedProjectId={selectedProjectId}
          onChange={onProjectChange}
          required
        />

        <FormTextField
          form={form}
          name="url"
          label="URL"
          required
          placeholder="https://example.com/page"
          transform={normalizeUrlInput}
        />

        <form.Subscribe selector={(s: { values: { url: string } }) => s.values.url}>
          {(url: string) => {
            const mismatch = getMismatchedHostname(url, selectedProject?.domains ?? []);
            if (!mismatch) {
              return null;
            }
            return (
              <Alert severity="info" sx={{ mt: -1 }}>
                <strong>{mismatch}</strong> isn&apos;t in this project&apos;s domain allowlist. The
                image will still generate, but the public meta tag won&apos;t serve on that domain.
                Add it under Project → Settings if you plan to use this image there.
              </Alert>
            );
          }}
        </form.Subscribe>

        <form.Subscribe selector={(s: { values: { kind: ImageKind } }) => s.values.kind}>
          {(kind: ImageKind) => {
            if (kind === "icon_set") {
              return (
                <Stack spacing={2}>
                  <Typography variant="captionMuted">
                    Favicon sets are always AI-generated from your brand signals (logo hint, theme
                    color, page analysis). Templates and styling options don&apos;t apply here.
                  </Typography>
                  <AiPromptOverrideFields form={form} hideModel />
                </Stack>
              );
            }

            return (
              <Stack spacing={3}>
                <AiGenerationField form={form} />

                {kind === "blog_hero" && (
                  <FormSelectField
                    form={form}
                    name="aspectRatio"
                    label="Aspect ratio"
                    items={ASPECT_RATIO_ITEMS}
                  />
                )}

                <form.Subscribe
                  selector={(s: { values: { aiGenerated: boolean } }) => s.values.aiGenerated}
                >
                  {(aiGenerated: boolean) =>
                    aiGenerated ? (
                      <Typography variant="captionMuted">
                        AI mode generates the full image from page content. Template and styling
                        options are not used.
                      </Typography>
                    ) : (
                      <Stack spacing={3}>
                        <TemplateField form={form} templates={templates} />
                        <StylingFields form={form} />
                      </Stack>
                    )
                  }
                </form.Subscribe>
              </Stack>
            );
          }}
        </form.Subscribe>

        <form.Subscribe selector={(s: { canSubmit: boolean }) => s.canSubmit}>
          {(canSubmit: boolean) => (
            <GenerateButton
              isGenerating={isGenerating}
              onClick={onGenerate}
              disabled={!selectedProjectId || !canSubmit}
            />
          )}
        </form.Subscribe>
      </Stack>
    </Surface>
  );
}
