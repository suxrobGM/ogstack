import type { ReactElement } from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { fontFamilies } from "@/theme";

export function AppLogo(): ReactElement {
  return (
    <Box
      component="a"
      href={ROUTES.home}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        textDecoration: "none",
      }}
    >
      <Image src="/logo-mark.svg" alt="OGStack Logo" width={28} height={28} />
      <Typography
        component="span"
        sx={{
          fontFamily: fontFamilies.body,
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: "-0.5px",
          color: "text.primary",
          "& span": { color: "accent.primary" },
        }}
      >
        og<span>stack</span>
      </Typography>
    </Box>
  );
}
