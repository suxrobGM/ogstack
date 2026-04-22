"use client";

import { useState, type ReactElement } from "react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightModeIcon from "@mui/icons-material/LightMode";
import TuneIcon from "@mui/icons-material/Tune";
import { Button, Collapse, Stack } from "@mui/material";
import { FormColorField, FormSelectField, FormToggleField } from "@/components/ui/form";
import type { AnyReactForm } from "@/components/ui/form/types";
import { iconSizes } from "@/theme";
import { FONT_FAMILIES, FONT_LABELS } from "../schema";
import { LogoFields } from "./logo-fields";

interface StylingFieldsProps {
  form: AnyReactForm;
}

const fontItems = FONT_FAMILIES.map((f) => ({ value: f, label: FONT_LABELS[f] }));

const MODE_ITEMS = [
  {
    value: true,
    label: (
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        <DarkModeIcon sx={{ fontSize: iconSizes.sm }} />
        <span>Dark</span>
      </Stack>
    ),
  },
  {
    value: false,
    label: (
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        <LightModeIcon sx={{ fontSize: iconSizes.sm }} />
        <span>Light</span>
      </Stack>
    ),
  },
] as const;

export function StylingFields(props: StylingFieldsProps): ReactElement {
  const { form } = props;
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing={2}>
      <Button
        size="small"
        variant="text"
        startIcon={<TuneIcon />}
        endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setOpen((v) => !v)}
        sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 500 }}
      >
        {open ? "Hide styling options" : "Customize styling"}
      </Button>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Stack spacing={3}>
          <FormColorField form={form} name="accent" label="Accent Color" />
          <FormToggleField form={form} name="dark" label="Mode" items={MODE_ITEMS} />
          <FormSelectField form={form} name="font" label="Font" items={fontItems} />
          <LogoFields form={form} />
        </Stack>
      </Collapse>
    </Stack>
  );
}
