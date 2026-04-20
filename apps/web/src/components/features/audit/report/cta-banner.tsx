import type { ReactElement } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { Button, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";

interface CtaBannerProps {
  url: string;
}

export function CtaBanner(props: CtaBannerProps): ReactElement {
  const { url } = props;
  const playgroundHref = `${ROUTES.playground}?url=${encodeURIComponent(url)}`;

  return (
    <Surface variant="expressive">
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <AutoFixHighIcon sx={{ color: "accent.primary", fontSize: 32 }} />
          <Stack spacing={0.5}>
            <Typography variant="h5">Fix it in seconds with OGStack</Typography>
            <Typography variant="body2Muted">
              Generate a beautiful OG image for this URL - no design work, one meta tag to paste.
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          size="large"
          href={playgroundHref}
          endIcon={<ArrowForwardIcon />}
        >
          Open in Playground
        </Button>
      </Stack>
    </Surface>
  );
}
