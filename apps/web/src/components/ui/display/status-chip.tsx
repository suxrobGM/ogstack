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
    color: "#FFC947",
    bg: "rgba(255,201,71,0.12)",
    border: "rgba(255,201,71,0.35)",
  },
  generated: {
    label: "generated",
    color: "#5CE1A1",
    bg: "rgba(92,225,161,0.12)",
    border: "rgba(92,225,161,0.35)",
  },
  processing: {
    label: "processing",
    color: "#7B3FF2",
    bg: "rgba(123,63,242,0.14)",
    border: "rgba(123,63,242,0.4)",
  },
  failed: {
    label: "failed",
    color: "#FF4B4B",
    bg: "rgba(255,75,75,0.12)",
    border: "rgba(255,75,75,0.4)",
  },
  pending: {
    label: "pending",
    color: "#B3A6C0",
    bg: "rgba(179,166,192,0.1)",
    border: "rgba(179,166,192,0.3)",
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
