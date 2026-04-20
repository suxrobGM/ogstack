"use client";

import type { ReactElement } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, Chip, Grid, InputAdornment, Stack, TextField } from "@mui/material";
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
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            placeholder="Search URL or title..."
            size="small"
            fullWidth
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
          />
        </Grid>
        {showProjectFilter && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SelectInput
              label="Project"
              value={filters.projectId}
              onChange={(value) => onChange("projectId", value)}
              items={[
                { value: "", label: "All projects" },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
              sx={{ width: "100%" }}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectInput<TemplateCategorySlug | "">
            label="Category"
            value={filters.category}
            onChange={(value) => onChange("category", value)}
            items={[
              { value: "", label: "All categories" },
              ...TEMPLATE_CATEGORIES.map((c) => ({ value: c.slug, label: c.label })),
            ]}
            sx={{ width: "100%" }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            type="date"
            size="small"
            label="From"
            fullWidth
            value={filters.from}
            onChange={(e) => onChange("from", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            type="date"
            size="small"
            label="To"
            fullWidth
            value={filters.to}
            onChange={(e) => onChange("to", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        {showClear && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
              <Button size="small" onClick={onClear}>
                Clear filters
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Stack>
  );
}
