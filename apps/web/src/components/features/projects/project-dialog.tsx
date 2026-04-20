"use client";

import { useEffect, type ReactElement } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { parseDomainList } from "@ogstack/shared";
import { useForm } from "@tanstack/react-form";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { Project } from "@/types/api";
import { projectFormSchema } from "./schema";

interface ProjectDialogProps {
  project?: Project | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Unified create/edit dialog for projects.
 * Pass a `project` to edit; omit it to create a new one.
 */
export function ProjectDialog(props: ProjectDialogProps): ReactElement {
  const { project, open, onClose } = props;
  const isEdit = !!project;

  const mutation = useApiMutation(
    (data: { name: string; domains: string[] }) =>
      isEdit ? client.api.projects({ id: project.id }).patch(data) : client.api.projects.post(data),
    {
      successMessage: isEdit ? "Project updated." : "Project created.",
      invalidateKeys: [queryKeys.projects.all],
      onSuccess: () => handleClose(),
    },
  );

  const form = useForm({
    defaultValues: {
      name: project?.name ?? "",
      domains: project?.domains.join(", ") ?? "",
    },
    validators: { onSubmit: projectFormSchema },
    onSubmit: async ({ value }) => {
      mutation.mutate({ name: value.name, domains: parseDomainList(value.domains) });
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: project?.name ?? "",
        domains: project?.domains.join(", ") ?? "",
      });
    }
  }, [project, open]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <DialogTitle>{isEdit ? "Edit Project" : "New Project"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField form={form} name="name" label="Project Name" required autoFocus />
            <FormTextField
              form={form}
              name="domains"
              label="Allowed Domains"
              placeholder="example.com, app.example.com"
              required
            />
            <Typography variant="captionMuted" sx={{ mt: -1 }}>
              Comma-separated list of domains allowed to use the public OG endpoint. Your plan caps
              how many domains you can add per project - upgrade to fit more.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" loading={mutation.isPending}>
            {isEdit ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
