import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";

interface IconListProps {
  label: string;
  icon: ReactElement;
  items: string[];
}

export function IconList(props: IconListProps): ReactElement {
  const { label, icon, items } = props;
  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" sx={{ color: "text.disabled" }}>
        {label}
      </Typography>
      <Stack spacing={1}>
        {items.map((item, idx) => (
          <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
            {icon}
            <Typography variant="body2">{item}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
