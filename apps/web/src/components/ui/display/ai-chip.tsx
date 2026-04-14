"use client";

import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Chip, type ChipProps } from "@mui/material";

interface AiChipProps {
  label: string;
  size?: ChipProps["size"];
  variant?: ChipProps["variant"];
  color?: ChipProps["color"];
}

export function AiChip(props: AiChipProps): ReactElement {
  const { label, size = "small", variant = "outlined", color = "success" } = props;
  return (
    <Chip
      size={size}
      variant={variant}
      color={color}
      icon={<AutoAwesomeIcon fontSize="small" />}
      label={label}
    />
  );
}
