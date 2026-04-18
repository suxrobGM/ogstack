import type { ReactElement } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LockIcon from "@mui/icons-material/Lock";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { Surface } from "@/components/ui/layout/surface";
import { accent, iconSizes } from "@/theme";
import { PanelHeader } from "./panel-header";
import { SAMPLE_INSIGHTS } from "./sample-data";
import { SuggestionBlock } from "./suggestion-block";

type Audience = "anonymous" | "free";

interface LockedPreviewProps {
  audience: Audience;
}

const COPY: Record<Audience, { href: string; label: string; body: string }> = {
  anonymous: {
    href: "/register?plan=pro",
    label: "Sign up for Pro",
    body: "This is a preview. Sign up for Pro to get real AI recommendations for your own pages.",
  },
  free: {
    href: "/billing",
    label: "Upgrade to Pro",
    body: "Upgrade to Pro to unlock AI recommendations for your own pages.",
  },
};

export function LockedPreview(props: LockedPreviewProps): ReactElement {
  const { href, label, body } = COPY[props.audience];

  return (
    <Surface sx={{ position: "relative", overflow: "hidden" }}>
      <Stack spacing={3}>
        <PanelHeader
          badge={
            <Chip
              size="small"
              icon={<LockIcon sx={{ fontSize: iconSizes.xs }} />}
              label="Sample"
              variant="outlined"
            />
          }
        />

        <Box
          sx={{
            filter: "blur(2.5px)",
            opacity: 0.55,
            userSelect: "none",
            pointerEvents: "none",
          }}
          aria-hidden
        >
          <Stack spacing={2}>
            <SuggestionBlock
              label="Suggested og:title"
              value={SAMPLE_INSIGHTS.suggestions.og.title}
              hint={`${SAMPLE_INSIGHTS.suggestions.og.title.length}/60 chars`}
            />
            <SuggestionBlock
              label="Suggested og:description"
              value={SAMPLE_INSIGHTS.suggestions.og.description}
              hint={`${SAMPLE_INSIGHTS.suggestions.og.description.length}/160 chars`}
            />
            <Stack spacing={1}>
              {SAMPLE_INSIGHTS.socialCtrTips.map((tip, idx) => (
                <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                  <TipsAndUpdatesIcon
                    sx={{ fontSize: iconSizes.xs, color: accent.primary, mt: "2px" }}
                  />
                  <Typography variant="body2">{tip}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Stack
            spacing={2}
            sx={{
              maxWidth: 420,
              textAlign: "center",
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              boxShadow: 8,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
              <AutoAwesomeIcon sx={{ color: accent.primary }} />
              <Typography variant="h6">Unlock AI Recommendations</Typography>
            </Stack>
            <Typography variant="body2Muted">{body}</Typography>
            <Box>
              <Button
                component={NextLink}
                href={href}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
              >
                {label}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Surface>
  );
}
