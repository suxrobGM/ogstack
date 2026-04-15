"use client";

import { type ReactElement } from "react";
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
import { projectFormSchema } from "./schema";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectDialog(props: CreateProjectDialogProps): ReactElement {
  const { open, onClose } = props;

  const mutation = useApiMutation(
    (data: { name: string; domains: string[] }) => client.api.projects.post(data),
    {
      successMessage: "Project created.",
      invalidateKeys: [["projects"]],
      onSuccess: () => handleClose(),
    },
  );

  const form = useForm({
    defaultValues: { name: "", domains: "" },
    validators: { onSubmit: projectFormSchema },
    onSubmit: async ({ value }) => {
      mutation.mutate({ name: value.name, domains: parseDomainList(value.domains) });
    },
  });

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
        <DialogTitle>New Project</DialogTitle>
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
            <Typography variant="caption" sx={{ color: "text.secondary", mt: -1 }}>
              At least one domain is required. Requests to the public OG endpoint for URLs outside
              this list will be blocked.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" loading={mutation.isPending}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
