"use client";

import type { ReactElement } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Button } from "@mui/material";
import { accent } from "@/theme";

interface GenerateButtonProps {
  isGenerating: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function GenerateButton(props: GenerateButtonProps): ReactElement {
  const { isGenerating, onClick, disabled } = props;

  return (
    <Button
      variant="contained"
      size="large"
      fullWidth
      onClick={onClick}
      disabled={isGenerating || disabled}
      startIcon={<PlayArrowIcon />}
      sx={{
        mt: 1,
        backgroundColor: accent.primary,
        "&:hover": { backgroundColor: accent.dark },
      }}
    >
      {isGenerating ? "Generating..." : "Generate"}
    </Button>
  );
}
