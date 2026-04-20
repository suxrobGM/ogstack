"use client";

import type { ReactElement } from "react";
import { Chip } from "@mui/material";
import type { ImageKind } from "@ogstack/shared";
import { IMAGE_KIND_LABELS } from "@/types/image-kinds";

interface ImageKindChipProps {
  kind: ImageKind;
}

// Opaque backdrops so the chip stays legible over any image. Matches the
// frosted style of ImageGenerationChip - see image-generation-chip.tsx.
const KIND_BACKGROUND: Record<ImageKind, string> = {
  og: "rgba(59, 130, 246, 0.92)", // blue
  blog_hero: "rgba(139, 92, 246, 0.92)", // violet
  icon_set: "rgba(234, 88, 12, 0.92)", // orange
};

/** Floating pill shown on image cards indicating the image kind. */
export function ImageKindChip(props: ImageKindChipProps): ReactElement {
  const { kind } = props;

  return (
    <Chip
      size="small"
      label={IMAGE_KIND_LABELS[kind]}
      sx={{
        color: "#fff",
        fontWeight: 500,
        backgroundColor: KIND_BACKGROUND[kind],
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
      }}
    />
  );
}
