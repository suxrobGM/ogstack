import type { ReactElement, ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { aubergine, gradients, line, noise, radii } from "@/theme";

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
          {
            position: "relative",
            backgroundColor: aubergine.surface,
            border: `1px solid ${line.borderHi}`,
            borderRadius: `${radii.lg}px`,
            padding,
            overflow: "hidden",
            boxShadow: "0 4px 24px -4px rgba(0,0,0,0.25)",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage: noise.grain,
              opacity: 0.06,
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
              backgroundImage: gradients.sunsetAmber,
              pointerEvents: "none",
            },
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
          backgroundColor: aubergine.surface,
          border: `1px solid ${line.border}`,
          borderRadius: `${radii.md}px`,
          padding,
          overflowX: "auto",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
