"use client";

import type { ReactElement } from "react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { AnyReactForm } from "@/components/ui/form/types";

interface ModeFieldProps {
  form: AnyReactForm;
}

export function ModeField(props: ModeFieldProps): ReactElement {
  const { form } = props;
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2Muted">Mode</Typography>
      <form.Field name="dark">
        {(field) => (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={field.state.value ? "dark" : "light"}
            onChange={(_, val) => {
              if (val !== null) field.handleChange(val === "dark");
            }}
          >
            <ToggleButton value="dark">
              <DarkModeIcon sx={{ fontSize: 18, mr: 0.5 }} />
              Dark
            </ToggleButton>
            <ToggleButton value="light">
              <LightModeIcon sx={{ fontSize: 18, mr: 0.5 }} />
              Light
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </form.Field>
    </Stack>
  );
}
