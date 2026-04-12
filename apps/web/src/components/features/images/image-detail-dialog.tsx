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
import { useForm } from "@tanstack/react-form";
import Image from "next/image";
import { CopyButton } from "@/components/ui/display/copy-button";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation, useConfirm } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { surfaces } from "@/theme";
import type { ImageItem } from "@/types/api";
import { imageEditFormSchema, type ImageEditFormValues } from "./schema";

interface ImageDetailDialogProps {
  image: ImageItem | null;
  onClose: () => void;
}

export function ImageDetailDialog(props: ImageDetailDialogProps): ReactElement {
  const { image, onClose } = props;
  const confirm = useConfirm();

  const [mode, setMode] = useState<"view" | "edit">("view");

  const updateMutation = useApiMutation(
    (body: ImageEditFormValues) => {
      if (!image) throw new Error("No image");
      return client.api.images({ id: image.id }).patch(body);
    },
    {
      successMessage: "Image updated.",
      invalidateKeys: [queryKeys.images.all],
      onSuccess: () => setMode("view"),
    },
  );

  const deleteMutation = useApiMutation(
    () => {
      if (!image) throw new Error("No image");
      return client.api.images({ id: image.id }).delete();
    },
    {
      successMessage: "Image deleted.",
      invalidateKeys: [queryKeys.images.all],
      onSuccess: () => onClose(),
    },
  );

  const form = useForm({
    defaultValues: {
      title: image?.title ?? "",
      description: image?.description ?? "",
    } as ImageEditFormValues,
    validators: { onSubmit: imageEditFormSchema },
    onSubmit: async ({ value }) => {
      updateMutation.mutate({
        title: value.title?.trim() ? value.title : undefined,
        description: value.description?.trim() ? value.description : undefined,
      });
    },
  });

  useEffect(() => {
    if (image) {
      form.reset({ title: image.title ?? "", description: image.description ?? "" });
      setMode("view");
    }
  }, [image?.id]);

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
                  alt={title}
                  fill
                  sizes="(max-width: 900px) 100vw, 900px"
                  style={{ objectFit: "contain" }}
                  unoptimized
                />
              </Box>

              {mode === "view" ? (
                <Stack spacing={1.5}>
                  <MetaRow label="Source URL">
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                        {image.sourceUrl ?? "—"}
                      </Typography>
                      {image.sourceUrl && <CopyButton text={image.sourceUrl} />}
                    </Stack>
                  </MetaRow>
                  <MetaRow label="Image URL">
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                        {image.cdnUrl ?? image.imageUrl}
                      </Typography>
                      <CopyButton text={image.cdnUrl ?? image.imageUrl} />
                    </Stack>
                  </MetaRow>
                  <MetaRow label="Template">
                    <Typography variant="body2">
                      {image.template
                        ? `${image.template.name} (${image.template.slug})`
                        : (image.category ?? "—")}
                    </Typography>
                  </MetaRow>
                  <MetaRow label="Project">
                    <Typography variant="body2">{image.projectName ?? "—"}</Typography>
                  </MetaRow>
                  <MetaRow label="Dimensions">
                    <Typography variant="body2">
                      {image.width} × {image.height}
                    </Typography>
                  </MetaRow>
                  <MetaRow label="Format">
                    <Typography variant="body2">{image.format}</Typography>
                  </MetaRow>
                  {image.generationMs !== null && (
                    <MetaRow label="Generation time">
                      <Typography variant="body2">{image.generationMs} ms</Typography>
                    </MetaRow>
                  )}
                  <MetaRow label="Serve count">
                    <Typography variant="body2">{image.serveCount}</Typography>
                  </MetaRow>
                  <MetaRow label="Created">
                    <Typography variant="body2">
                      {new Date(image.createdAt).toLocaleString()}
                    </Typography>
                  </MetaRow>
                  {image.description && (
                    <MetaRow label="Description">
                      <Typography variant="body2">{image.description}</Typography>
                    </MetaRow>
                  )}
                </Stack>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                >
                  <Stack spacing={2}>
                    <FormTextField form={form} name="title" label="Title" />
                    <FormTextField
                      form={form}
                      name="description"
                      label="Description"
                      multiline
                      minRows={3}
                    />
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <Button onClick={() => setMode("view")}>Cancel</Button>
                      <Button type="submit" variant="contained" loading={updateMutation.isPending}>
                        Save
                      </Button>
                    </Stack>
                  </Stack>
                </form>
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

function MetaRow(props: { label: string; children: ReactElement }): ReactElement {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Typography
        variant="captionMuted"
        sx={{ minWidth: 140, textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {props.label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{props.children}</Box>
    </Stack>
  );
}
