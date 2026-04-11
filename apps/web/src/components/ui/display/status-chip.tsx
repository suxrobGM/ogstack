import type { ReactElement } from "react";
import { Chip } from "@mui/material";

export type OgStatus = "cached" | "generated" | "processing" | "failed" | "pending";

interface StatusChipProps {
  status: OgStatus;
  size?: "small" | "medium";
}

const STATUS_CONFIG: Record<
  OgStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  cached: {
    label: "cached",
    color: "#A16207",
    bg: "rgba(202,138,4,0.08)",
    border: "rgba(202,138,4,0.25)",
  },
  generated: {
    label: "generated",
    color: "#15803D",
    bg: "rgba(21,128,61,0.08)",
    border: "rgba(21,128,61,0.25)",
  },
  processing: {
    label: "processing",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.25)",
  },
  failed: {
    label: "failed",
    color: "#DC2626",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.25)",
  },
  pending: {
    label: "pending",
    color: "#8C8378",
    bg: "rgba(140,131,120,0.08)",
    border: "rgba(140,131,120,0.25)",
  },
};

/**
 * Canonical status pill for OGStack image / job states.
 * Fixed color mapping per status — consumers pass only the `status` value.
 */
export function StatusChip(props: StatusChipProps): ReactElement {
  const { status, size = "small" } = props;
  const config = STATUS_CONFIG[status];

  return (
    <Chip
      size={size}
      label={`● ${config.label}`}
      sx={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
      }}
    />
  );
}
