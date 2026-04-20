"use client";

import { useState, type ReactElement } from "react";
import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import type { ImageKind } from "@ogstack/shared";
import { PageHeader } from "@/components/ui/layout/page-header";
import { accent, line, motion, radii, shadows, surfaces } from "@/theme";
import type { Project, TemplateInfo } from "@/types/api";
import { templateThumbnailUrl } from "@/utils/url";
import { TemplatePreviewDialog } from "./template-preview-dialog";

type AspectPreview = Extract<ImageKind, "og" | "blog_hero">;

const ASPECT_PREVIEW_OPTIONS: Array<{ value: AspectPreview; label: string; cssAspect: string }> = [
  { value: "og", label: "OG preview", cssAspect: "1200 / 630" },
  { value: "blog_hero", label: "Hero preview", cssAspect: "16 / 9" },
];

interface TemplateGalleryProps {
  initialTemplates: TemplateInfo[];
  projects: Project[];
}

export function TemplateGallery(props: TemplateGalleryProps): ReactElement {
  const { initialTemplates, projects } = props;

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [aspectPreview, setAspectPreview] = useState<AspectPreview>("og");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateInfo | null>(null);

  const categories = Array.from(new Set(initialTemplates.map((t) => t.category)));
  const visible =
    selectedCategory === "all"
      ? initialTemplates
      : initialTemplates.filter((t) => t.category === selectedCategory);
  const cssAspect =
    ASPECT_PREVIEW_OPTIONS.find((o) => o.value === aspectPreview)?.cssAspect ?? "1200 / 630";

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <PageHeader
        title="Templates"
        description="Browse our template library and preview with your content. Every template renders at any supported size — pick your aspect at render time."
      />

      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          {ASPECT_PREVIEW_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              color={aspectPreview === option.value ? "primary" : "default"}
              variant={aspectPreview === option.value ? "filled" : "outlined"}
              onClick={() => setAspectPreview(option.value)}
            />
          ))}
        </Stack>

        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          <Chip
            label="All"
            color={selectedCategory === "all" ? "primary" : "default"}
            variant={selectedCategory === "all" ? "filled" : "outlined"}
            onClick={() => setSelectedCategory("all")}
          />
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              color={selectedCategory === cat ? "primary" : "default"}
              variant={selectedCategory === cat ? "filled" : "outlined"}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </Stack>
      </Stack>

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {visible.map((template) => (
          <Grid key={template.slug} size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              onClick={() => setPreviewTemplate(template)}
              sx={{
                cursor: "pointer",
                borderRadius: `${radii.sm}px`,
                border: `1px solid ${line.border}`,
                backgroundColor: surfaces.card,
                overflow: "hidden",
                transition: `all ${motion.fast}`,
                "&:hover": {
                  borderColor: accent.primary,
                  boxShadow: shadows.md,
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: cssAspect,
                  backgroundColor: surfaces.elevated,
                  backgroundImage: `url(${templateThumbnailUrl(template.slug, aspectPreview)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {template.name}
                </Typography>
                <Typography variant="body2Muted" sx={{ mt: 0.5 }}>
                  {template.description}
                </Typography>
                <Chip
                  label={template.category}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1, height: 20, fontSize: "0.65rem" }}
                />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <TemplatePreviewDialog
        template={previewTemplate}
        projects={projects}
        onClose={() => setPreviewTemplate(null)}
      />
    </Stack>
  );
}
