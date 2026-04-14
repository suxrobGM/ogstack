import type { ReactElement, ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { line, radii, shadows, surfaces } from "@/theme";

interface SurfaceProps {
  variant?: "quiet" | "expressive";
  padding?: number | string;
  children: ReactNode;
  sx?: SxProps<Theme>;
  className?: string;
}

/**
 * Primary card/panel primitive for OGStack.
 *
 * Defaults to the "quiet" mode (flat, hairline border, subtle shadow) used in
 * dense data zones. Opt-in to "expressive" for landing, hero, playground,
 * and empty-state surfaces — adds an accent border and stronger shadow.
 */
export function Surface(props: SurfaceProps): ReactElement {
  const { variant = "quiet", padding = 3, children, sx, className } = props;

  if (variant === "expressive") {
    return (
      <Box
        className={className}
        sx={[
          {
            position: "relative",
            backgroundColor: surfaces.card,
            border: `1px solid ${line.borderHi}`,
            borderRadius: `${radii.lg}px`,
            padding,
            overflow: "hidden",
            boxShadow: shadows.lg,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={[
        {
          backgroundColor: surfaces.card,
          border: `1px solid ${line.border}`,
          borderRadius: `${radii.md}px`,
          padding,
          overflowX: "auto",
          boxShadow: shadows.md,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
