import type { PropsWithChildren, ReactElement } from "react";
import { Box } from "@mui/material";
import { AuthProvider } from "@/providers/auth-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import { gradients } from "@/theme/tokens";

export default function AuthLayout(props: PropsWithChildren): ReactElement {
  const { children } = props;

  return (
    <NotificationProvider>
      <AuthProvider initialUser={null}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            px: 2,
            py: 6,
            backgroundImage: gradients.mesh,
            bgcolor: "aubergine.base",
          }}
        >
          {children}
        </Box>
      </AuthProvider>
    </NotificationProvider>
  );
}
