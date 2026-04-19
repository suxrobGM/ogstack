import type { ReactElement } from "react";
import { Box, CircularProgress } from "@mui/material";

export default function AuthLoading(): ReactElement {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 440,
        minHeight: 360,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={32} />
    </Box>
  );
}
