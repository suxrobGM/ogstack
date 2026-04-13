import type { ReactElement } from "react";
import { CircularProgress, Container, Stack, Typography } from "@mui/material";

export default function Loading(): ReactElement {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack sx={{ alignItems: "center", py: 8 }} spacing={2}>
        <CircularProgress />
        <Typography variant="body2Muted">Loading audit report…</Typography>
      </Stack>
    </Container>
  );
}
