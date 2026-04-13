import type { PropsWithChildren, ReactElement } from "react";
import { Container } from "@mui/material";

export default function AuditLayout({ children }: PropsWithChildren): ReactElement {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {children}
    </Container>
  );
}
