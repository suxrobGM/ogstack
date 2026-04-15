import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";

interface SuggestionBlockProps {
  label: string;
  value: string;
  hint?: string;
}

export function SuggestionBlock(props: SuggestionBlockProps): ReactElement {
  const { label, value, hint } = props;
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
        <Typography variant="overline" sx={{ color: "text.disabled" }}>
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {hint}
          </Typography>
        )}
      </Stack>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  );
}
