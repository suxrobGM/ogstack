import type { ReactElement } from "react";
import { Alert, CircularProgress, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import { PanelHeader } from "./panel-header";

export function PendingView(): ReactElement {
  return (
    <Surface>
      <Stack spacing={2}>
        <PanelHeader />
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <CircularProgress size={18} />
          <Typography variant="body2Muted">Analyzing with AI - usually 30-60 seconds.</Typography>
        </Stack>
      </Stack>
    </Surface>
  );
}

export function FailedView(props: { error: string | null }): ReactElement {
  return (
    <Surface>
      <Stack spacing={2}>
        <PanelHeader />
        <Alert severity="info" variant="outlined">
          AI analysis unavailable — the rule-based audit above is complete.
          {props.error && (
            <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.7 }}>
              {props.error}
            </Typography>
          )}
        </Alert>
      </Stack>
    </Surface>
  );
}

export function EmptyProView(): ReactElement {
  return (
    <Surface>
      <Stack spacing={2}>
        <PanelHeader />
        <Typography variant="body2Muted">
          AI recommendations were skipped for this audit. Re-run with the &ldquo;Include AI
          recommendations&rdquo; option enabled to generate suggestions.
        </Typography>
      </Stack>
    </Surface>
  );
}
