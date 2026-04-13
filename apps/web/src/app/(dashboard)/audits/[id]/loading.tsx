import type { ReactElement } from "react";
import { CircularProgress, Stack, Typography } from "@mui/material";

export default function Loading(): ReactElement {
  return (
    <Stack sx={{ alignItems: "center", py: 8 }} spacing={2}>
      <CircularProgress />
      <Typography variant="body2Muted">Loading audit report…</Typography>
    </Stack>
  );
}
