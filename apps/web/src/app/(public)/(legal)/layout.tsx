import type { PropsWithChildren, ReactElement } from "react";
import { Box, Container } from "@mui/material";

export default function LegalLayout(props: PropsWithChildren): ReactElement {
  const { children } = props;
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container
        maxWidth="md"
        sx={{
          "& h2": { mt: 5, mb: 2 },
          "& h3": { mt: 4, mb: 1.5 },
          "& p": { color: "text.secondary", lineHeight: 1.75, mb: 2 },
          "& ul": { pl: 3, mb: 2, color: "text.secondary" },
          "& li": { mb: 0.75, lineHeight: 1.7 },
          "& a": { color: "accent.primary" },
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
