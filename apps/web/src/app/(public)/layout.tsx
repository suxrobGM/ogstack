import type { PropsWithChildren, ReactElement } from "react";
import { Box } from "@mui/material";
import { Footer, LandingNavbar } from "@/components/features/landing";

export default function PublicLayout({ children }: PropsWithChildren): ReactElement {
  return (
    <Box
      sx={{
        bgcolor: "surfaces.base",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <LandingNavbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
