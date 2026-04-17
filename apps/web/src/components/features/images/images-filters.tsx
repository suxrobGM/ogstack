"use client";

import type { ReactElement } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Chip, InputAdornment, Stack, TextField } from "@mui/material";
import {
  IMAGE_KINDS,
  TEMPLATE_CATEGORIES,
  type ImageKind,
  type TemplateCategorySlug,
} from "@ogstack/shared";
import { SelectInput } from "@/components/ui/form/select-input";
import type { Project } from "@/types/api";

export interface ImageGalleryFilters {
  search: string;
  projectId: string;
  category: TemplateCategorySlug | "";
  kind: ImageKind | "";
  from: string;
  to: string;
}

interface ImagesFiltersProps {
  filters: ImageGalleryFilters;
  onChange: <K extends keyof ImageGalleryFilters>(key: K, value: ImageGalleryFilters[K]) => void;
  onClear: () => void;
  showClear: boolean;
  projects: Project[];
  showProjectFilter: boolean;
}

const KIND_CHIP_LABELS: Record<ImageKind | "", string> = {
  "": "All",
  og: "OG",
  blog_hero: "Hero",
  icon_set: "Favicons",
};

const KIND_CHIP_VALUES: readonly (ImageKind | "")[] = ["", ...IMAGE_KINDS];

export function ImagesFilters(props: ImagesFiltersProps): ReactElement {
  const { filters, onChange, onClear, showClear, projects, showProjectFilter } = props;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        {KIND_CHIP_VALUES.map((value) => (
          <Chip
            key={value || "all"}
            label={KIND_CHIP_LABELS[value]}
            color={filters.kind === value ? "primary" : "default"}
            variant={filters.kind === value ? "filled" : "outlined"}
            onClick={() => onChange("kind", value)}
            size="small"
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
        <TextField
          placeholder="Search URL or title..."
          size="small"
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 240 }}
        />
        {showProjectFilter && (
          <SelectInput
            label="Project"
            value={filters.projectId}
            onChange={(value) => onChange("projectId", value)}
            items={[
              { value: "", label: "All projects" },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
            minWidth={180}
          />
        )}
        <SelectInput<TemplateCategorySlug | "">
          label="Category"
          value={filters.category}
          onChange={(value) => onChange("category", value)}
          items={[
            { value: "", label: "All categories" },
            ...TEMPLATE_CATEGORIES.map((c) => ({ value: c.slug, label: c.label })),
          ]}
          minWidth={180}
        />
        <TextField
          type="date"
          size="small"
          label="From"
          value={filters.from}
          onChange={(e) => onChange("from", e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          type="date"
          size="small"
          label="To"
          value={filters.to}
          onChange={(e) => onChange("to", e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        {showClear && (
          <Button size="small" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
