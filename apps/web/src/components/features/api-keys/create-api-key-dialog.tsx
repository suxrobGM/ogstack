"use client";

import { useState, type ReactElement } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api";

interface CreateApiKeyDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof schema>;

export function CreateApiKeyDialog(props: CreateApiKeyDialogProps): ReactElement {
  const { projectId, open, onClose } = props;
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const mutation = useApiMutation(
    (data: FormValues) => client.api.projects({ projectId, id: projectId })["api-keys"].post(data),
    {
      successMessage: "API key created.",
      invalidateKeys: [["api-keys"]],
      onSuccess: (result) => {
        if (result?.data?.key) {
          setCreatedKey(result.data.key);
        }
      },
    },
  );

  const form = useForm({
    defaultValues: { name: "" } as FormValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => mutation.mutate(value),
  });

  function handleClose() {
    setCreatedKey(null);
    form.reset();
    onClose();
  }

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
                slotProps={{ input: { readOnly: true } }}
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
              <form.Field name="name">
                {(field) => <FormTextField field={field} label="Key Name" required />}
              </form.Field>
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
