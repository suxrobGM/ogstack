"use client";

import { useEffect, type ReactElement } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { Plan, PLAN_CONFIGS, UNLIMITED } from "@ogstack/shared";
import { useForm } from "@tanstack/react-form";
import { FormDomainField, FormTextField } from "@/components/ui/form";
import type { AnyReactForm } from "@/components/ui/form/types";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
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
  const { user } = useAuth();
  const cap = PLAN_CONFIGS[user?.plan ?? Plan.FREE].domainsPerProject;
  const isUnlimited = cap === UNLIMITED;

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
      domains: project?.domains ?? [],
    },
    validators: { onSubmit: projectFormSchema },
    onSubmit: async ({ value }) => {
      mutation.mutate({ name: value.name, domains: value.domains });
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: project?.name ?? "",
        domains: project?.domains ?? [],
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
            <FormTextField
              form={form as unknown as AnyReactForm}
              name="name"
              label="Project Name"
              required
              autoFocus
            />
            <FormDomainField form={form as unknown as AnyReactForm} name="domains" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <form.Subscribe selector={(s) => s.values.domains}>
            {(domains) => {
              const overCap = !isUnlimited && domains.length > cap;
              return (
                <Button
                  type="submit"
                  variant="contained"
                  loading={mutation.isPending}
                  disabled={overCap}
                >
                  {isEdit ? "Save" : "Create"}
                </Button>
              );
            }}
          </form.Subscribe>
        </DialogActions>
      </form>
    </Dialog>
  );
}
