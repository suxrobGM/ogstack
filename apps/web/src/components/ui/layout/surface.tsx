import type { ReactElement, ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

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
 * Defaults to the "quiet" mode (flat, hairline border, no glow) used in
 * dense data zones. Opt-in to "expressive" for landing, hero, playground,
 * and empty-state surfaces — adds a grain overlay and a top gradient edge.
 */
export function Surface(props: SurfaceProps): ReactElement {
  const { variant = "quiet", padding = 3, children, sx, className } = props;

  if (variant === "expressive") {
    return (
      <Box
        className={className}
        sx={[
          (t) => ({
            position: "relative",
            backgroundColor: t.palette.aubergine.surface,
            border: `1px solid ${t.palette.line.border}`,
            borderRadius: `${t.radii.lg}px`,
            padding,
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage: t.noise.grain,
              opacity: 0.08,
              mixBlendMode: "overlay",
              pointerEvents: "none",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundImage: t.gradients.sunsetAmber,
              pointerEvents: "none",
            },
          }),
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
        (t) => ({
          backgroundColor: t.palette.aubergine.surface,
          border: `1px solid ${t.palette.line.border}`,
          borderRadius: `${t.radii.md}px`,
          padding,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
