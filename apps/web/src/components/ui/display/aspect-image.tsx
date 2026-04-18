"use client";

import type { ReactElement, SyntheticEvent } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import Image from "next/image";

interface AspectImageProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  sizes?: string;
  objectFit?: "cover" | "contain";
  onLoad?: (e: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: SyntheticEvent<HTMLImageElement>) => void;
  sx?: SxProps<Theme>;
}

/**
 * Renders an image that fills the width of its container while maintaining an aspect ratio (default 1200×630). The image is cropped if necessary to
 * avoid distortion.
 */
export function AspectImage(props: AspectImageProps): ReactElement {
  const {
    src,
    alt,
    aspectRatio = "1200 / 630",
    sizes = "(max-width: 900px) 100vw, 900px",
    objectFit = "cover",
    onLoad,
    onError,
    sx,
  } = props;

  return (
    <Box
      sx={[
        { position: "relative", width: "100%", aspectRatio, overflow: "hidden" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        onLoad={onLoad}
        onError={onError}
        style={{ objectFit }}
        unoptimized
      />
    </Box>
  );
}
