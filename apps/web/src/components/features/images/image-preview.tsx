"use client";

import type { ReactElement } from "react";
import { Box } from "@mui/material";
import Image from "next/image";
import { surfaces } from "@/theme";
import type { ImageItem } from "@/types/api";

interface ImagePreviewProps {
  image: ImageItem;
  alt: string;
}

export function ImagePreview(props: ImagePreviewProps): ReactElement {
  const { image, alt } = props;
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "1200 / 630",
        backgroundColor: surfaces.elevated,
        overflow: "hidden",
      }}
    >
      <Image
        src={image.cdnUrl ?? image.imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 900px) 100vw, 900px"
        style={{ objectFit: "contain" }}
        unoptimized
      />
    </Box>
  );
}
