"use client";

import { useState, type ReactElement } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { CopyButton } from "@/components/ui/display/copy-button";
import { FormSelectField, FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { Project } from "@/types/api";
import { createApiKeySchema, type CreateApiKeyForm } from "./schema";

const ALL_PROJECTS = "__all__";

interface CreateApiKeyDialogProps {
  projects: Project[];
  defaultProjectId?: string;
  open: boolean;
  onClose: () => void;
}

export function CreateApiKeyDialog(props: CreateApiKeyDialogProps): ReactElement {
  const { projects, defaultProjectId, open, onClose } = props;
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const mutation = useApiMutation(
    (data: { name: string; projectId: string | null }) => client.api["api-keys"].post(data),
    {
      successMessage: "API key created.",
      invalidateKeys: [queryKeys.apiKeys.all],
      onSuccess: (result) => {
        if (result?.key) {
          setCreatedKey(result.key);
        }
      },
    },
  );

  const form = useForm({
    defaultValues: {
      name: "",
      projectId: defaultProjectId ?? ALL_PROJECTS,
    } as CreateApiKeyForm,
    validators: { onSubmit: createApiKeySchema },
    onSubmit: ({ value }) =>
      mutation.mutate({
        name: value.name,
        projectId: value.projectId === ALL_PROJECTS ? null : value.projectId,
      }),
  });

  const handleClose = () => {
    setCreatedKey(null);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {createdKey ? (
        <>
          <DialogTitle>API Key Created</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Alert severity="warning">Copy this key now. It will not be shown again.</Alert>
              <TextField
                value={createdKey}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <CopyButton text={createdKey} tooltip="Copy API key" />
                      </InputAdornment>
                    ),
                  },
                }}
                label="Your API Key"
                size="small"
              />
              <Typography variant="body2Muted">
                Use this key in the <code>Authorization: Bearer</code> header for API requests.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleClose}>
              Done
            </Button>
          </DialogActions>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogTitle>New API Key</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormTextField form={form} name="name" label="Key Name" required />
              <FormSelectField
                form={form}
                name="projectId"
                label="Scope"
                items={[
                  { value: ALL_PROJECTS, label: "All projects" },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" loading={mutation.isPending}>
              Create
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}
