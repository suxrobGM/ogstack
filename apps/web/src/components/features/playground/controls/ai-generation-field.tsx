"use client";

import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Collapse, Stack, Switch, TextField, Typography } from "@mui/material";
import type { AnyReactForm } from "@/components/ui/form/types";
import { accent, line, radii } from "@/theme";
import { AI_PROMPT_MAX_CHARS } from "../schema";

interface AiGenerationFieldProps {
  form: AnyReactForm;
}

export function AiGenerationField(props: AiGenerationFieldProps): ReactElement {
  const { form } = props;

  return (
    <form.Subscribe selector={(s: { values: { aiGenerated: boolean } }) => s.values.aiGenerated}>
      {(aiGenerated: boolean) => (
        <Stack spacing={1.5}>
          <form.Field name="aiGenerated">
            {(field) => (
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
                  <AutoAwesomeIcon sx={{ fontSize: 18, color: accent.primary }} />
                  <Stack spacing={0}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Generate with AI
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pro plan or higher. Flux creates the full image from page content.
                    </Typography>
                  </Stack>
                </Stack>
                <Switch
                  checked={!!field.state.value}
                  onChange={(_, checked) => field.handleChange(checked)}
                />
              </Stack>
            )}
          </form.Field>

          <Collapse in={aiGenerated} timeout="auto" unmountOnExit>
            <AiPromptField form={form} />
          </Collapse>
        </Stack>
      )}
    </form.Subscribe>
  );
}

function AiPromptField(props: { form: AnyReactForm }): ReactElement {
  return (
    <props.form.Field name="aiPrompt">
      {(field) => {
        const len = (field.state.value as string | undefined)?.length ?? 0;
        const overLimit = len > AI_PROMPT_MAX_CHARS;
        return (
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label="Custom prompt (optional)"
            placeholder="e.g. A futuristic city skyline at dusk, neon reflections, editorial photograph"
            value={field.state.value ?? ""}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={overLimit}
            helperText={`${len} / ${AI_PROMPT_MAX_CHARS} characters`}
            slotProps={{ htmlInput: { maxLength: AI_PROMPT_MAX_CHARS } }}
          />
        );
      }}
    </props.form.Field>
  );
}
