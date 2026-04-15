import type { ReactElement, ReactNode } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Stack, Typography } from "@mui/material";
import { accent, iconSizes } from "@/theme";

interface PanelHeaderProps {
  badge?: ReactNode;
}

export function PanelHeader(props: PanelHeaderProps): ReactElement {
  const { badge } = props;
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      <AutoAwesomeIcon sx={{ fontSize: iconSizes.sm, color: accent.primary }} />
      <Typography variant="h5" sx={{ flex: 1 }}>
        AI Recommendations
      </Typography>
      {badge}
    </Stack>
  );
}
