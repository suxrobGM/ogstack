import type { ReactElement } from "react";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { PLATFORM_ICONS } from "@/components/icons";
import { line } from "@/theme/palette";
import { radii, shadows } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";
import type { PageAuditPreviewMetadata } from "@/types/api";
import { truncate, type PlatformConfig } from "./platforms";

interface PlatformPreviewCardProps {
  platform: PlatformConfig;
  metadata: PageAuditPreviewMetadata;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ImageBlock(props: { image: string | null; aspect: string }): ReactElement {
  const { image, aspect } = props;
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: aspect,
        bgcolor: "surfaces.elevated",
        overflow: "hidden",
      }}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          style={{ objectFit: "cover" }}
          unoptimized
        />
      ) : (
        <Stack
          sx={{ inset: 0, position: "absolute", alignItems: "center", justifyContent: "center" }}
        >
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            No og:image
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

export function PlatformPreviewCard(props: PlatformPreviewCardProps): ReactElement {
  const { platform, metadata } = props;
  const host = hostname(metadata.url);
  const title = truncate(metadata.title, platform.titleMax);
  const description = truncate(metadata.description, platform.descMax);
  const Icon = PLATFORM_ICONS[platform.id];

  const shell = (children: ReactElement) => (
    <Stack
      sx={{
        bgcolor: "surfaces.card",
        borderRadius: `${radii.md}px`,
        border: `1px solid ${line.border}`,
        boxShadow: shadows.sm,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: "surfaces.elevated",
          borderBottom: `1px solid ${line.divider}`,
          alignItems: "center",
        }}
      >
        {Icon && (
          <Box sx={{ color: platform.hintColor, display: "flex", alignItems: "center" }}>
            <Icon width={14} height={14} />
          </Box>
        )}
        <Typography
          variant="body1Muted"
          sx={{
            fontFamily: fontFamilies.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {platform.name}
        </Typography>
      </Stack>
      {children}
    </Stack>
  );

  if (platform.layout === "large" || platform.layout === "square") {
    return shell(
      <Box>
        <ImageBlock image={metadata.image} aspect={platform.imageAspect} />
        <Stack spacing={0.5} sx={{ p: 1.75 }}>
          <Typography variant="caption" sx={{ color: "text.disabled", textTransform: "uppercase" }}>
            {host}
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
            {title || "Untitled"}
          </Typography>
          {description && (
            <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.4 }}>
              {description}
            </Typography>
          )}
        </Stack>
      </Box>,
    );
  }

  // compact (Slack / Telegram / Discord) - real unfurls put text first with a
  // small square thumbnail on the right, not a full-width image below.
  return shell(
    <Stack direction="row" spacing={1.5} sx={{ p: 1.5, alignItems: "stretch" }}>
      <Box
        sx={{
          width: 3,
          borderRadius: 2,
          bgcolor: platform.hintColor,
          flexShrink: 0,
        }}
      />
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {metadata.siteName || host}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: platform.hintColor,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title || "Untitled"}
        </Typography>
        {description && (
          <Typography
            variant="body1Muted"
            sx={{
              fontSize: 12,
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </Typography>
        )}
      </Stack>
      {metadata.image && (
        <Box
          sx={{
            width: 64,
            height: 64,
            flexShrink: 0,
            borderRadius: 1,
            overflow: "hidden",
            position: "relative",
            bgcolor: "surfaces.elevated",
          }}
        >
          <Image
            src={metadata.image}
            alt=""
            fill
            sizes="64px"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </Box>
      )}
    </Stack>,
  );
}
