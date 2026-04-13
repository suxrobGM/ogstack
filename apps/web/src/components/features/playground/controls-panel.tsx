"use client";

import type { ReactElement } from "react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { AnyFieldApi } from "@tanstack/react-form";
import { FormSelectField } from "@/components/ui/form/form-select-field";
import { FormTextField } from "@/components/ui/form/form-text-field";
import type { AnyReactForm } from "@/components/ui/form/types";
import { Surface } from "@/components/ui/layout/surface";
import { accent, line, radii } from "@/theme";
import type { Project, TemplateInfo } from "@/types/api";
import { normalizeUrlInput } from "@/utils/url";
import { FONT_FAMILIES, FONT_LABELS, LOGO_POSITION_LABELS, LOGO_POSITIONS } from "./schema";
import { TemplateSelector } from "./template-selector";

interface ControlsPanelProps {
  form: AnyReactForm;
  templates: TemplateInfo[];
  projects: Pick<Project, "id" | "name">[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

const fontItems = FONT_FAMILIES.map((f) => ({ value: f, label: FONT_LABELS[f] }));
const positionItems = LOGO_POSITIONS.map((p) => ({ value: p, label: LOGO_POSITION_LABELS[p] }));

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

  return (
    <Surface>
      <Stack spacing={3}>
        {/* Project selector */}
        <Stack spacing={0.5}>
          <Typography variant="body2Muted">Project</Typography>
          <Select
            size="small"
            value={selectedProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        {/* URL input */}
        <FormTextField
          form={form}
          name="url"
          label="URL"
          placeholder="https://example.com/page"
          transform={normalizeUrlInput}
        />

        {/* Template selection */}
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Template
          </Typography>
          <form.Field name="template">
            {(field: AnyFieldApi) => (
              <TemplateSelector
                templates={templates}
                selected={field.state.value}
                onSelect={(slug) => field.handleChange(slug)}
              />
            )}
          </form.Field>
        </Stack>

        {/* Accent color */}
        <Stack spacing={0.5}>
          <Typography variant="body2Muted">Accent Color</Typography>
          <form.Field name="accent">
            {(field: AnyFieldApi) => (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  component="input"
                  type="color"
                  value={field.state.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
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
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                      field.handleChange(v);
                    }
                  }}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0}
                  slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: "0.875rem" } } }}
                  sx={{ width: 120 }}
                />
              </Stack>
            )}
          </form.Field>
        </Stack>

        {/* Dark/Light mode toggle */}
        <Stack spacing={0.5}>
          <Typography variant="body2Muted">Mode</Typography>
          <form.Field name="dark">
            {(field: AnyFieldApi) => (
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

        {/* Font selector */}
        <FormSelectField form={form} name="font" label="Font" items={fontItems} />

        {/* Logo controls */}
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

        {/* Generate button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onGenerate}
          disabled={isGenerating}
          startIcon={<PlayArrowIcon />}
          sx={{
            mt: 1,
            backgroundColor: accent.primary,
            "&:hover": { backgroundColor: accent.dark },
          }}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </Stack>
    </Surface>
  );
}
