import type { ElementType, ReactElement, ReactNode } from "react";
import { CardActions, CardContent, CardHeader } from "@mui/material";
import { Surface } from "./surface";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: ElementType;
  /** Color for the header icon. Defaults to the brand accent. */
  color?: string;
  /** Element rendered on the right side of the header (e.g. an edit button). */
  action?: ReactNode;
  /** Trailing row rendered as a `CardActions` footer (e.g. a save button). */
  footer?: ReactNode;
  variant?: "quiet" | "expressive";
  children: ReactNode;
}

/**
 * Canonical icon + title section card: `CardHeader` + `CardContent`
 * (+ optional `CardActions` footer) composed inside a `Surface`. Header
 * title/subheader typography comes from the `MuiCardHeader` theme override.
 */
export function SectionCard(props: SectionCardProps): ReactElement {
  const {
    title,
    subtitle,
    icon: Icon,
    color = "accent.primary",
    action,
    footer,
    variant = "quiet",
    children,
  } = props;

  return (
    <Surface variant={variant}>
      <CardHeader
        avatar={Icon ? <Icon sx={{ color, display: "block" }} /> : undefined}
        title={title}
        subheader={subtitle}
        action={action}
      />
      <CardContent>{children}</CardContent>
      {footer && <CardActions>{footer}</CardActions>}
    </Surface>
  );
}
