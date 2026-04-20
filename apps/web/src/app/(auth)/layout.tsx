import type { PropsWithChildren, ReactElement } from "react";
import { Box } from "@mui/material";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

export default function AuthLayout(props: PropsWithChildren): ReactElement {
  const { children } = props;

  return (
    <QueryProvider>
      <AuthProvider initialUser={null}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            px: { xs: 1.5, sm: 2 },
            py: { xs: 3, sm: 6 },
            bgcolor: "surfaces.base",
          }}
        >
          {children}
        </Box>
      </AuthProvider>
    </QueryProvider>
  );
}
