"use client";

import type { ChangeEvent, ReactElement, ReactNode } from "react";
import { Box, Stack, TextField, Typography } from "@mui/material";
import type { AnyFieldApi } from "@tanstack/react-form";
import { line, radii } from "@/theme";
import type { AnyReactForm } from "./types";

interface FormColorFieldProps {
  form: AnyReactForm;
  name: string;
  label?: ReactNode;
}

/** TanStack Form-bound color picker with a synced hex text input. Accepts partial hex input during typing. */
export function FormColorField(props: FormColorFieldProps): ReactElement {
  const { form, name, label } = props;

  return (
    <Stack spacing={0.5}>
      {label && <Typography variant="body2Muted">{label}</Typography>}
      <form.Field name={name}>
        {(field: AnyFieldApi) => (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              component="input"
              type="color"
              value={field.state.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
              sx={{
                width: 40,
                height: 40,
                padding: 0,
                border: `1px solid ${line.border}`,
                borderRadius: `${radii.xs}px`,
                cursor: "pointer",
                backgroundColor: "transparent",
                "&::-webkit-color-swatch-wrapper": { padding: 0 },
                "&::-webkit-color-swatch": {
                  border: "none",
                  borderRadius: `${radii.xs - 1}px`,
                },
              }}
            />
            <TextField
              size="small"
              value={field.state.value}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) field.handleChange(v);
              }}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.length > 0}
              helperText={
                (field.state.meta.errors[0] as { message?: string })?.message ??
                field.state.meta.errors[0]?.toString()
              }
              slotProps={{
                input: { sx: { fontFamily: "monospace", fontSize: "0.875rem" } },
              }}
              sx={{ width: 140 }}
            />
          </Stack>
        )}
      </form.Field>
    </Stack>
  );
}
