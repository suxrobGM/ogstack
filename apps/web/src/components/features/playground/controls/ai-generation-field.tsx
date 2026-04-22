"use client";

import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Collapse, Stack, Typography } from "@mui/material";
import { Plan } from "@ogstack/shared";
import {
  FormCheckboxField,
  FormSwitchField,
  FormTextField,
  FormToggleField,
} from "@/components/ui/form";
import type { AnyReactForm } from "@/components/ui/form/types";
import { useAuth } from "@/providers";
import { accent, iconSizes, line, radii } from "@/theme";
import { AI_PROMPT_MAX_CHARS } from "../schema";

interface AiGenerationFieldProps {
  form: AnyReactForm;
}

/**
 * AI toggle for OG/hero kinds. When on, reveals the shared prompt + full-override
 * controls via `AiPromptOverrideFields`. Icon-set skips this wrapper since AI is
 * always on for favicons.
 */
export function AiGenerationField(props: AiGenerationFieldProps): ReactElement {
  const { form } = props;

  return (
    <form.Subscribe selector={(s: { values: { aiGenerated: boolean } }) => s.values.aiGenerated}>
      {(aiGenerated: boolean) => (
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              border: `1px solid ${line.border}`,
              borderRadius: `${radii.sm}px`,
              padding: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <AutoAwesomeIcon sx={{ fontSize: iconSizes.sm, color: accent.primary }} />
              <Stack spacing={0}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Generate with AI
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  AI creates the full image from page content.
                </Typography>
              </Stack>
            </Stack>
            <FormSwitchField form={form} name="aiGenerated" />
          </Stack>

          <Collapse in={aiGenerated} timeout="auto" unmountOnExit>
            <AiPromptOverrideFields form={form} />
          </Collapse>
        </Stack>
      )}
    </form.Subscribe>
  );
}

interface AiPromptOverrideFieldsProps {
  form: AnyReactForm;
  /** Hide the model picker (e.g. icon-set doesn't expose Pro/Standard). */
  hideModel?: boolean;
}

/**
 * Inner controls shared between OG/hero (behind the AI on/off switch) and
 * icon_set (always AI-on, so the controls render flat).
 */
export function AiPromptOverrideFields(props: AiPromptOverrideFieldsProps): ReactElement {
  const { form, hideModel = false } = props;
  return (
    <Stack spacing={1.5}>
      {!hideModel && <AiModelField form={form} />}
      <FormTextField
        form={form}
        name="aiPrompt"
        size="small"
        multiline
        rows={3}
        label="Custom prompt (optional)"
        placeholder="e.g. A futuristic city skyline at dusk, neon reflections, editorial photograph"
        charLimit={AI_PROMPT_MAX_CHARS}
      />
      <FormCheckboxField
        form={form}
        name="fullOverride"
        label={
          <Stack spacing={0}>
            <Typography variant="body2">Use prompt as full override</Typography>
            <Typography variant="caption" color="text.secondary">
              Ignore page content - use your prompt as-is for the image.
            </Typography>
          </Stack>
        }
      />
    </Stack>
  );
}

/**
 * Standard/Pro quality toggle for AI renders. Pro is gated on the user's plan -
 * non-Pro users see the option disabled with an upgrade hint.
 */
function AiModelField(props: { form: AnyReactForm }): ReactElement {
  const { form } = props;
  const { user } = useAuth();
  const canUsePro = user?.plan === Plan.PRO;

  const items = [
    { value: "standard", label: "Standard" },
    { value: "pro", label: "Pro", disabled: !canUsePro },
  ] as const;

  return (
    <Stack spacing={1}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Image quality
      </Typography>
      <FormToggleField form={form} name="aiModel" items={items} fullWidth />
      <Typography variant="captionMuted">
        {canUsePro
          ? "Pro uses a higher-fidelity model with a separate monthly quota."
          : "Upgrade to Pro to access the premium image model."}
      </Typography>
    </Stack>
  );
}
