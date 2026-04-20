"use client";

import type { ReactElement } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { Chip, InputAdornment, Stack, TextField } from "@mui/material";
import { IMAGE_KINDS, type ImageKind } from "@ogstack/shared";
import { SelectInput } from "@/components/ui/form/select-input";
import type { TemplateInfo } from "@/types/api";
import { IMAGE_KIND_LABELS } from "@/types/image-kinds";
import type { AdminImageFilters, AiFilter } from "./use-admin-image-filters";

interface AdminImageFiltersBarProps {
  filters: AdminImageFilters;
  setFilter: <K extends keyof AdminImageFilters>(key: K, value: AdminImageFilters[K]) => void;
  templates: TemplateInfo[];
}

export function AdminImageFiltersBar(props: AdminImageFiltersBarProps): ReactElement {
  const { filters, setFilter, templates } = props;

  const templateItems = [
    { value: "", label: "All templates" },
    ...templates.map((t) => ({ value: t.slug, label: t.name })),
  ];

  const kindItems = [
    { value: "" as const, label: "All kinds" },
    ...IMAGE_KINDS.map((k) => ({ value: k, label: IMAGE_KIND_LABELS[k] })),
  ];

  const aiItems: { value: AiFilter; label: string }[] = [
    { value: "", label: "Any" },
    { value: "ai", label: "AI only" },
    { value: "template", label: "Template only" },
  ];

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
      <TextField
        placeholder="Search by source URL or title..."
        size="small"
        value={filters.search}
        onChange={(e) => setFilter("search", e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: 360, flex: 1, minWidth: 220 }}
      />
      <SelectInput<ImageKind | "">
        label="Kind"
        value={filters.kind}
        onChange={(v) => setFilter("kind", v)}
        items={kindItems}
      />
      <SelectInput<string>
        label="Template"
        value={filters.templateSlug}
        onChange={(v) => setFilter("templateSlug", v)}
        items={templateItems}
      />
      <SelectInput<AiFilter>
        label="AI"
        value={filters.ai}
        onChange={(v) => setFilter("ai", v)}
        items={aiItems}
      />
      <TextField
        label="From"
        type="date"
        size="small"
        value={filters.from}
        onChange={(e) => setFilter("from", e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ minWidth: 150 }}
      />
      <TextField
        label="To"
        type="date"
        size="small"
        value={filters.to}
        onChange={(e) => setFilter("to", e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ minWidth: 150 }}
      />
      {filters.userId && (
        <Chip
          label={`User: ${filters.userId.slice(0, 8)}`}
          onDelete={() => setFilter("userId", "")}
          deleteIcon={<CloseIcon />}
          size="small"
        />
      )}
      {filters.projectId && (
        <Chip
          label={`Project: ${filters.projectId.slice(0, 8)}`}
          onDelete={() => setFilter("projectId", "")}
          deleteIcon={<CloseIcon />}
          size="small"
        />
      )}
    </Stack>
  );
}
