"use client";

import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import type { AnyReactForm } from "@/components/ui/form/types";
import type { TemplateInfo } from "@/types/api";
import { TemplateSelector } from "../template-selector";

interface TemplateFieldProps {
  form: AnyReactForm;
  templates: TemplateInfo[];
}

export function TemplateField(props: TemplateFieldProps): ReactElement {
  const { form, templates } = props;

  return (
    <Stack spacing={1}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Template
      </Typography>
      <form.Field name="template">
        {(field) => (
          <TemplateSelector
            templates={templates}
            selected={field.state.value}
            onSelect={(slug) => field.handleChange(slug)}
          />
        )}
      </form.Field>
    </Stack>
  );
}
