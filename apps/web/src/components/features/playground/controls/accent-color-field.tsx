"use client";

import type { ChangeEvent, ReactElement } from "react";
import { Box, Stack, TextField, Typography } from "@mui/material";
import type { AnyReactForm } from "@/components/ui/form/types";
import { line, radii } from "@/theme";

interface AccentColorFieldProps {
  form: AnyReactForm;
}

export function AccentColorField(props: AccentColorFieldProps): ReactElement {
  const { form } = props;
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2Muted">Accent Color</Typography>
      <form.Field name="accent">
        {(field) => (
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
              slotProps={{
                input: { sx: { fontFamily: "monospace", fontSize: "0.875rem" } },
              }}
              sx={{ width: 120 }}
            />
          </Stack>
        )}
      </form.Field>
    </Stack>
  );
}
