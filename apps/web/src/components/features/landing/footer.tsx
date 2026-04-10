import type { ReactElement } from "react";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { ROUTES } from "@/lib/constants";
import { line } from "@/theme/palette";

export function Footer(): ReactElement {
  return (
    <Box component="footer" sx={{ py: 6, borderTop: `1px solid ${line.divider}` }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
          spacing={3}
        >
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              OGStack
            </Typography>
            <Typography variant="body2Muted">Developer-first OG image generation</Typography>
          </Box>
          <Stack direction="row" spacing={4}>
            <Link href={ROUTES.docs} variant="body2Muted" underline="hover">
              Docs
            </Link>
            <Link href={ROUTES.login} variant="body2Muted" underline="hover">
              Sign in
            </Link>
            <Link href={ROUTES.register} variant="body2Muted" underline="hover">
              Get started
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
