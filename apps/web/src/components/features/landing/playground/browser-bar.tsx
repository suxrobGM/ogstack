import type { ReactElement } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { line, surfaces } from "@/theme/palette";
import { fontFamilies } from "@/theme/typography";

const DOTS = [
  { bg: "#FECACA", border: "#F87171" },
  { bg: "#FEF08A", border: "#FACC15" },
  { bg: "#BBF7D0", border: "#4ADE80" },
] as const;

interface BrowserBarProps {
  url: string;
}

export function BrowserBar(props: BrowserBarProps): ReactElement {
  const { url } = props;
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        gap: 0.75,
        px: 2,
        py: 1.5,
        bgcolor: surfaces.elevated,
        borderBottom: `1px solid ${line.border}`,
      }}
    >
      {DOTS.map((dot, i) => (
        <Box
          key={i}
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: dot.bg,
            border: `1.5px solid ${dot.border}`,
          }}
        />
      ))}
      <Typography
        variant="body1Muted"
        sx={{ flex: 1, textAlign: "center", fontFamily: fontFamilies.mono, fontSize: 12 }}
      >
        {url}
      </Typography>
    </Stack>
  );
}
