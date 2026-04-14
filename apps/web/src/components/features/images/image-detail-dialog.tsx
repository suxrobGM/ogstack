"use client";

import { useEffect, useState, type ReactElement } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers/confirm-provider";
import type { ImageItem } from "@/types/api";
import { ImageEditForm } from "./image-edit-form";
import { ImageMetadata } from "./image-metadata";
import { ImagePreview } from "./image-preview";

interface ImageDetailDialogProps {
  image: ImageItem | null;
  onClose: () => void;
}

export function ImageDetailDialog(props: ImageDetailDialogProps): ReactElement {
  const { image, onClose } = props;
  const confirm = useConfirm();
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (image) setMode("view");
  }, [image?.id]);

  const deleteMutation = useApiMutation(
    () => {
      if (!image) throw new Error("No image");
      return client.api.images({ id: image.id }).delete();
    },
    {
      successMessage: "Image deleted.",
      invalidateKeys: [queryKeys.images.all],
      onSuccess: onClose,
    },
  );

  const handleDelete = async () => {
    if (!image) return;
    const confirmed = await confirm({
      title: "Delete image?",
      description:
        "This removes the image from your history. The cached asset may still be served until expiry.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (confirmed) deleteMutation.mutate();
  };

  const title = image?.title ?? image?.sourceUrl ?? "Untitled";

  return (
    <Dialog open={image !== null} onClose={onClose} maxWidth="lg" fullWidth>
      {image && (
        <>
          <DialogTitle>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="h5" sx={{ flex: 1, minWidth: 0 }} noWrap>
                {title}
              </Typography>
              {mode === "view" && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setMode("edit")}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <ImagePreview image={image} alt={title} />
              {mode === "view" ? (
                <ImageMetadata image={image} />
              ) : (
                <ImageEditForm
                  image={image}
                  onCancel={() => setMode("view")}
                  onSuccess={() => setMode("view")}
                />
              )}
            </Stack>
          </DialogContent>
          {mode === "view" && (
            <DialogActions>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                startIcon={<OpenInNewIcon />}
                href={image.cdnUrl ?? image.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </Button>
              <Button onClick={onClose} variant="contained">
                Close
              </Button>
            </DialogActions>
          )}
        </>
      )}
    </Dialog>
  );
}
