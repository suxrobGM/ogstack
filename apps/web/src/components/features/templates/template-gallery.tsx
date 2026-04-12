"use client";

import { useState, type ReactElement } from "react";
import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { PageHeader } from "@/components/ui/layout/page-header";
import { accent, line, motion, radii, shadows, surfaces } from "@/theme";
import type { Project, TemplateInfo } from "@/types/api";
import { TemplatePreviewDialog } from "./template-preview-dialog";

interface TemplateGalleryProps {
  initialTemplates: TemplateInfo[];
  projects: Project[];
}

function getThumbnailSrc(slug: string): string {
  return `/images/templates/${slug.replace(/_/g, "-")}.webp`;
}

export function TemplateGallery(props: TemplateGalleryProps): ReactElement {
  const { initialTemplates, projects } = props;

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateInfo | null>(null);

  const categories = Array.from(new Set(initialTemplates.map((t) => t.category)));
  const visible =
    selectedCategory === "all"
      ? initialTemplates
      : initialTemplates.filter((t) => t.category === selectedCategory);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Templates"
        description="Browse our template library and preview with your content."
      />

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
                  backgroundImage: `url(${getThumbnailSrc(template.slug)})`,
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
