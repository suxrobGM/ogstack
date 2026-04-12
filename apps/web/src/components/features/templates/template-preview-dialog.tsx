"use client";

import { useState, type ReactElement } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { surfaces } from "@/theme";
import type { GenerateDto, ImageGenerateBody, Project, TemplateInfo } from "@/types/api";

const SAMPLE_PREVIEW_URL = "https://vercel.com/blog/introducing-vercel-agent";

interface TemplatePreviewDialogProps {
  template: TemplateInfo | null;
  projects: Project[];
  onClose: () => void;
}

export function TemplatePreviewDialog(props: TemplatePreviewDialogProps): ReactElement {
  const { template, projects, onClose } = props;
  const router = useRouter();

  const [projectId, setProjectId] = useState<string>(() => projects[0]?.id ?? "");
  const [preview, setPreview] = useState<GenerateDto | null>(null);

  const mutation = useApiMutation((body: ImageGenerateBody) => client.api.images.post(body), {
    errorMessage: "Failed to generate preview.",
    onSuccess: (data) => setPreview(data as GenerateDto),
  });

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  const handleGenerate = () => {
    if (!template || !projectId) return;
    mutation.mutate({
      url: SAMPLE_PREVIEW_URL,
      template: template.slug,
      projectId,
    });
  };

  const handleOpenInPlayground = () => {
    if (!template) return;
    router.push(`/playground?template=${template.slug}` as Route);
  };

  return (
    <Dialog open={template !== null} onClose={handleClose} maxWidth="lg" fullWidth>
      {template && (
        <>
          <DialogTitle>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Typography variant="h5">{template.name}</Typography>
              <Chip label={template.category} size="small" variant="outlined" />
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography variant="body2Muted">{template.description}</Typography>
              <TextField
                select
                label="Project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                size="small"
                disabled={projects.length === 0}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Preview URL"
                value={SAMPLE_PREVIEW_URL}
                size="small"
                helperText="Sample URL used for this preview only."
                slotProps={{ input: { readOnly: true } }}
              />
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={mutation.isPending || !projectId}
              >
                {mutation.isPending ? "Generating…" : "Generate preview"}
              </Button>
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1200 / 630",
                  backgroundColor: surfaces.elevated,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {preview?.imageUrl ? (
                  <img
                    src={preview.imageUrl}
                    alt={`${template.name} preview`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Typography variant="body2Muted">
                    Click Generate preview to render this template.
                  </Typography>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleOpenInPlayground}>Open in Playground</Button>
            <Button onClick={handleClose} variant="contained">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
