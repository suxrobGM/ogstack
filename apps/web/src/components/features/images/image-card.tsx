"use client";

import type { ReactElement } from "react";
import LockIcon from "@mui/icons-material/Lock";
import { Box, Checkbox, Stack, Tooltip, Typography } from "@mui/material";
import { isPlanAtLeast, Plan } from "@ogstack/shared";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { line, motion, radii, shadows, surfaces } from "@/theme";
import type { ImageItem } from "@/types/api";
import { ImageGenerationChip } from "./image-generation-chip";

interface ImageCardProps {
  item: ImageItem;
  selected: boolean;
  onToggleSelect: () => void;
}

export function ImageCard(props: ImageCardProps): ReactElement {
  const { item, selected, onToggleSelect } = props;
  const { user } = useAuth();
  const isAi = Boolean(item.aiModel);
  const title = item.title ?? item.sourceUrl ?? "Untitled";
  const caption = item.template?.name ?? item.category ?? "—";

  const generatedOnPlan = (item.generatedOnPlan ?? Plan.FREE) as Plan;
  const currentPlan = (user?.plan ?? Plan.FREE) as Plan;
  const tierLocked = !isPlanAtLeast(currentPlan, generatedOnPlan);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: `${radii.sm}px`,
        border: `1px solid ${selected ? line.borderHi : line.border}`,
        backgroundColor: surfaces.card,
        overflow: "hidden",
        transition: `all ${motion.fast}`,
        "&:hover": { boxShadow: shadows.md },
        "&:hover .img-select": { opacity: 1 },
      }}
    >
      <Box
        className="img-select"
        sx={{
          position: "absolute",
          top: 6,
          left: 6,
          zIndex: 2,
          backgroundColor: "rgba(0,0,0,0.55)",
          borderRadius: `${radii.xs ?? 4}px`,
          opacity: selected ? 1 : 0,
          transition: `opacity ${motion.fast}`,
        }}
      >
        <Checkbox
          size="small"
          checked={selected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          sx={{ color: "#fff", "&.Mui-checked": { color: "#fff" } }}
        />
      </Box>

      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
        <ImageGenerationChip isAi={isAi} />
      </Box>

      <Link
        href={`/images/${item.id}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "1200 / 630",
            overflow: "hidden",
          }}
        >
          <Image
            src={item.cdnUrl ?? item.imageUrl}
            alt={title}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 33vw, 25vw"
            style={{
              objectFit: "cover",
              filter: tierLocked ? "grayscale(1)" : undefined,
              opacity: tierLocked ? 0.4 : 1,
            }}
            unoptimized
          />
          {tierLocked && (
            <Tooltip
              title={`Generated on ${generatedOnPlan} tier. Re-subscribe to ${generatedOnPlan} to serve and download this image.`}
            >
              <Stack
                spacing={0.5}
                sx={{
                  position: "absolute",
                  inset: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.35)",
                  color: "#fff",
                }}
              >
                <LockIcon />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Locked · {generatedOnPlan}
                </Typography>
              </Stack>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="captionMuted"
            sx={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {caption}
          </Typography>
        </Box>
      </Link>
    </Box>
  );
}
