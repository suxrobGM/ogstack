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
import { useForm } from "@tanstack/react-form";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import type { Project } from "@/types/api";
import { parseDomains } from "@/utils/parse-domains";
import { projectFormSchema, type ProjectFormValues } from "./schema";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function EditProjectDialog(props: EditProjectDialogProps): ReactElement {
  const { project, open, onClose } = props;

  const mutation = useApiMutation(
    (data: { name: string; domains?: string[] }) =>
      client.api.projects({ id: project!.id }).patch(data),
    {
      successMessage: "Project updated.",
      invalidateKeys: [["projects"]],
      onSuccess: () => handleClose(),
    },
  );

  const form = useForm({
    defaultValues: {
      name: project?.name ?? "",
      domains: project?.domains.join(", ") ?? "",
    } as ProjectFormValues,
    validators: { onSubmit: projectFormSchema },
    onSubmit: async ({ value }) => {
      mutation.mutate({ name: value.name, domains: parseDomains(value.domains) });
    },
  });

  useEffect(() => {
    if (project && open) {
      form.reset({
        name: project.name,
        domains: project.domains.join(", "),
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
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField form={form} name="name" label="Project Name" required autoFocus />
            <FormTextField
              form={form}
              name="domains"
              label="Allowed Domains"
              placeholder="example.com, app.example.com"
            />
            <Typography variant="captionMuted" sx={{ mt: -1 }}>
              Comma-separated list of domains allowed to use the public OG endpoint. Leave empty to
              allow all.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" loading={mutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
