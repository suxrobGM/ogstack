"use client";

import type { ReactElement } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton, Tooltip } from "@mui/material";
import { useToast } from "@/hooks";

interface CopyButtonProps {
  text: string;
  tooltip?: string;
  size?: "small" | "medium";
  onCopied?: () => void;
}

/**
 * Icon button that copies a string to clipboard and shows a toast confirmation.
 * Silent on SSR — relies on `navigator.clipboard` which is available in the browser.
 */
export function CopyButton(props: CopyButtonProps): ReactElement {
  const { text, tooltip = "Copy to clipboard", size = "small", onCopied } = props;
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
      onCopied?.();
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Tooltip title={tooltip} arrow>
      <IconButton
        size={size}
        onClick={handleCopy}
        sx={{
          color: "text.disabled",
          "&:hover": { color: "accent.primary" },
        }}
      >
        <ContentCopyIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}
