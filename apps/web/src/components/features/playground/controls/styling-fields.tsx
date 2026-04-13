"use client";

import { useState, type ReactElement } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import { Button, Collapse, Stack } from "@mui/material";
import { FormSelectField } from "@/components/ui/form/form-select-field";
import type { AnyReactForm } from "@/components/ui/form/types";
import { FONT_FAMILIES, FONT_LABELS } from "../schema";
import { AccentColorField } from "./accent-color-field";
import { LogoFields } from "./logo-fields";
import { ModeField } from "./mode-field";

interface StylingFieldsProps {
  form: AnyReactForm;
}

const fontItems = FONT_FAMILIES.map((f) => ({ value: f, label: FONT_LABELS[f] }));

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
          <AccentColorField form={form} />
          <ModeField form={form} />
          <FormSelectField form={form} name="font" label="Font" items={fontItems} />
          <LogoFields form={form} />
        </Stack>
      </Collapse>
    </Stack>
  );
}
