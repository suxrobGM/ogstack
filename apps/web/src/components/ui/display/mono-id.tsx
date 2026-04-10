"use client";

import type { ReactElement } from "react";
import { Box, Stack } from "@mui/material";
import { fontFamilies } from "@/theme";
import { CopyButton } from "./copy-button";

interface MonoIdProps {
  id: string;
  truncate?: boolean;
  copyable?: boolean;
  size?: "small" | "medium";
}

/**
 * Inline mono-formatted identifier, optionally middle-truncated and copyable.
 * Example: `proj_01F7BQX4` → truncate: `proj_0…QX4`.
 */
export function MonoId(props: MonoIdProps): ReactElement {
  const { id, truncate = false, copyable = false, size = "small" } = props;
  const displayed = truncate && id.length > 14 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
  const fontSize = size === "small" ? "0.8125rem" : "0.875rem";

  const idSpan = (
    <Box
      component="span"
      sx={{
        fontFamily: fontFamilies.mono,
        fontSize,
        color: "text.disabled",
        letterSpacing: "0.02em",
      }}
    >
      {displayed}
    </Box>
  );

  if (!copyable) return idSpan;

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", display: "inline-flex" }}>
      {idSpan}
      <CopyButton text={id} size="small" tooltip={`Copy ${id}`} />
    </Stack>
  );
}
