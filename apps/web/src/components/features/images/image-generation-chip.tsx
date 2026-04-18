"use client";

import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import { Chip } from "@mui/material";

interface ImageGenerationChipProps {
  isAi: boolean;
}

/**
 * Floating pill shown on image cards indicating AI vs template-generated.
 * Uses a frosted backdrop so it remains legible over both light and dark images.
 */
export function ImageGenerationChip(props: ImageGenerationChipProps): ReactElement {
  const { isAi } = props;

  return (
    <Chip
      size="small"
      icon={
        isAi ? <AutoAwesomeIcon fontSize="small" /> : <DashboardCustomizeIcon fontSize="small" />
      }
      label={isAi ? "AI" : "Template"}
      sx={{
        color: "#fff",
        backgroundColor: isAi ? "rgba(16, 185, 129, 0.92)" : "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        "& .MuiChip-icon": { color: "#fff" },
      }}
    />
  );
}
