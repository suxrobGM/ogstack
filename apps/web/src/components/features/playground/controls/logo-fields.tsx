"use client";

import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import { FormSelectField } from "@/components/ui/form/form-select-field";
import { FormTextField } from "@/components/ui/form/form-text-field";
import type { AnyReactForm } from "@/components/ui/form/types";
import { LOGO_POSITION_LABELS, LOGO_POSITIONS } from "../schema";

interface LogoFieldsProps {
  form: AnyReactForm;
}

const positionItems = LOGO_POSITIONS.map((p) => ({ value: p, label: LOGO_POSITION_LABELS[p] }));

export function LogoFields(props: LogoFieldsProps): ReactElement {
  const { form } = props;

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Logo (optional)
      </Typography>
      <FormTextField
        form={form}
        name="logoUrl"
        label="Logo URL"
        placeholder="https://example.com/logo.png"
        size="small"
      />
      <FormSelectField
        form={form}
        name="logoPosition"
        label="Logo Position"
        items={positionItems}
      />
    </Stack>
  );
}
