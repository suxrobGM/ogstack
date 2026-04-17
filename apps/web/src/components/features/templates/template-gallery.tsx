"use client";

import { useState, type ReactElement } from "react";
import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import type { ImageKind } from "@ogstack/shared";
import { PageHeader } from "@/components/ui/layout/page-header";
import { accent, line, motion, radii, shadows, surfaces } from "@/theme";
import type { Project, TemplateInfo } from "@/types/api";
import { templateThumbnailUrl } from "@/utils/og-image";
import { TemplatePreviewDialog } from "./template-preview-dialog";

type KindFilter = "all" | ImageKind;

const KIND_FILTERS: Array<{ value: KindFilter; label: string }> = [
  { value: "all", label: "All kinds" },
  { value: "og", label: "OG" },
  { value: "blog_hero", label: "Hero" },
];

interface TemplateGalleryProps {
  initialTemplates: TemplateInfo[];
  projects: Project[];
}

export function TemplateGallery(props: TemplateGalleryProps): ReactElement {
  const { initialTemplates, projects } = props;

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedKind, setSelectedKind] = useState<KindFilter>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateInfo | null>(null);

  const kindFiltered =
    selectedKind === "all"
      ? initialTemplates
      : initialTemplates.filter((t) => t.supportedKinds.includes(selectedKind));

  const categories = Array.from(new Set(kindFiltered.map((t) => t.category)));
  const visible =
    selectedCategory === "all"
      ? kindFiltered
      : kindFiltered.filter((t) => t.category === selectedCategory);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Templates"
        description="Browse our template library and preview with your content."
      />

      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {KIND_FILTERS.map((kind) => (
            <Chip
              key={kind.value}
              label={kind.label}
              color={selectedKind === kind.value ? "primary" : "default"}
              variant={selectedKind === kind.value ? "filled" : "outlined"}
              onClick={() => {
                setSelectedKind(kind.value);
                setSelectedCategory("all");
              }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
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

      <Grid container spacing={2}>
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
                  aspectRatio: "1200 / 630",
                  backgroundColor: surfaces.elevated,
                  backgroundImage: `url(${templateThumbnailUrl(template.slug)})`,
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
