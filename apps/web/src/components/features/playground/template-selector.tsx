"use client";

import type { ReactElement } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Chip, Grid, Typography } from "@mui/material";
import type { ImageKind } from "@ogstack/shared";
import { accent, iconSizes, line, motion, radii, shadows, surfaces } from "@/theme";
import type { TemplateInfo } from "@/types/api";
import { templateThumbnailUrl } from "@/utils/url";

interface TemplateSelectorProps {
  templates: TemplateInfo[];
  selected: string;
  onSelect: (slug: string) => void;
  kind: ImageKind;
}

const THUMB_ASPECT_RATIO: Record<ImageKind, string> = {
  og: "1200 / 630",
  blog_hero: "16 / 9",
  icon_set: "1 / 1",
};

export function TemplateSelector(props: TemplateSelectorProps): ReactElement {
  const { templates, selected, onSelect, kind } = props;
  const thumbAspectRatio = THUMB_ASPECT_RATIO[kind];

  return (
    <Box
      sx={{
        maxHeight: 420,
        overflowY: "auto",
        pr: 0.5,
      }}
    >
      <Grid container spacing={1.5}>
        {templates.map((template) => {
          const isSelected = selected === template.slug;
          const thumbnailSrc = templateThumbnailUrl(template.slug, kind);

          return (
            <Grid key={template.slug} size={6}>
              <Box
                onClick={() => onSelect(template.slug)}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: `${radii.sm}px`,
                  border: `2px solid ${isSelected ? accent.primary : line.border}`,
                  backgroundColor: isSelected ? surfaces.elevated : surfaces.card,
                  overflow: "hidden",
                  transition: `all ${motion.fast}`,
                  "&:hover": {
                    borderColor: isSelected ? accent.primary : line.borderHi,
                    boxShadow: shadows.md,
                  },
                }}
              >
                {isSelected && (
                  <CheckCircleIcon
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      fontSize: iconSizes.sm,
                      color: accent.primary,
                      zIndex: 1,
                    }}
                  />
                )}

                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: thumbAspectRatio,
                    backgroundColor: surfaces.elevated,
                    backgroundImage: thumbnailSrc ? `url(${thumbnailSrc})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!thumbnailSrc && <Typography variant="captionMuted">{template.name}</Typography>}
                </Box>

                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                    {template.name}
                  </Typography>
                  <Chip
                    label={template.category}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.5, height: 20, fontSize: "0.65rem" }}
                  />
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
