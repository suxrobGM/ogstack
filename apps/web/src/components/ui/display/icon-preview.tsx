"use client";

import type { ReactElement } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import Image from "next/image";
import { line, radii, surfaces } from "@/theme";

interface IconPreviewProps {
  src: string;
  alt: string;
  size?: number;
  bordered?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Renders a square icon (e.g. 512×512 favicon) at native size, centered in
 * an elevated frame. Prevents the blurry upscale from stretching it into an
 * OG-aspect container.
 */
export function IconPreview(props: IconPreviewProps): ReactElement {
  const { src, alt, size = 512, bordered = false, sx } = props;
  return (
    <Box
      sx={[
        {
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: surfaces.elevated,
          padding: 2,
          ...(bordered
            ? { border: `1px solid ${line.border}`, borderRadius: `${radii.sm}px` }
            : {}),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        sizes={`${size}px`}
        style={{ maxWidth: "100%", height: "auto" }}
        unoptimized
      />
    </Box>
  );
}
