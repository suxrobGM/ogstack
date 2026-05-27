import type { ElementType, ReactElement, ReactNode } from "react";
import { Card, type CardProps } from "@mui/material";
import { line, motion, shadows } from "@/theme";

type SurfaceProps = Omit<CardProps, "variant"> & {
  variant?: "quiet" | "expressive";
  interactive?: boolean;
  component?: ElementType;
  href?: string;
  children: ReactNode;
};

/**
 * Primary card/panel primitive for OGStack - a thin wrapper over MUI `Card`.
 *
 * The base look (background, hairline border, radius, shadow) comes from the
 * `MuiCard` theme override, so `Surface` only layers on the "expressive" accent
 * (used for landing, hero, playground, auth, and empty-state surfaces) and the
 * optional `interactive` hover lift. Padding lives in `CardContent`, not here.
 */
export function Surface(props: SurfaceProps): ReactElement {
  const { variant = "quiet", interactive, children, sx, ...rest } = props;

  return (
    <Card
      {...rest}
      sx={[
        variant === "expressive" && {
          borderColor: line.borderHi,
          boxShadow: shadows.lg,
        },
        interactive && {
          cursor: "pointer",
          transition: motion.standard,
          "&:hover": {
            transform: "translateY(-3px)",
            borderColor: line.borderHi,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Card>
  );
}
