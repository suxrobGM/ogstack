"use client";

import type { ReactElement } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Button } from "@mui/material";
import { accent } from "@/theme";

interface GenerateButtonProps {
  isGenerating: boolean;
  onClick: () => void;
}

export function GenerateButton(props: GenerateButtonProps): ReactElement {
  const { isGenerating, onClick } = props;

  return (
    <Button
      variant="contained"
      size="large"
      fullWidth
      onClick={onClick}
      disabled={isGenerating}
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
