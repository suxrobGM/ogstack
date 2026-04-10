import type { ReactElement, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Surface } from "../layout/surface";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "quiet" | "expressive";
}

/**
 * Placeholder shown when a collection is empty or filters yield no results.
 * Quiet variant: flat surface, centered text. Expressive: grain + gradient edge.
 */
export function EmptyState(props: EmptyStateProps): ReactElement {
  const { icon, title, description, action, variant = "quiet" } = props;

  return (
    <Surface variant={variant} padding={6} sx={{ textAlign: "center" }}>
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        {icon && (
          <Box
            sx={{
              color: "text.disabled",
              fontSize: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="h4" sx={{ color: "text.primary" }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420 }}>
            {description}
          </Typography>
        )}
        {action && <Box sx={{ mt: 1 }}>{action}</Box>}
      </Stack>
    </Surface>
  );
}
