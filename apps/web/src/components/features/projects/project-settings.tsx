"use client";

import type { ReactElement } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { FormDomainField, FormTextField } from "@/components/ui/form";
import type { AnyReactForm } from "@/components/ui/form/types";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers/confirm-provider";
import type { Project } from "@/types/api";
import { projectFormSchema } from "./schema";

interface ProjectSettingsProps {
  project: Project;
}

export function ProjectSettings(props: ProjectSettingsProps): ReactElement {
  const { project } = props;
  const router = useRouter();
  const confirm = useConfirm();

  const updateMutation = useApiMutation(
    (data: { name: string; domains?: string[] }) =>
      client.api.projects({ id: project.id }).patch(data),
    {
      successMessage: "Project updated.",
      invalidateKeys: [queryKeys.projects.all],
    },
  );

  const deleteMutation = useApiMutation(() => client.api.projects({ id: project.id }).delete(), {
    successMessage: "Project deleted.",
    invalidateKeys: [queryKeys.projects.all],
    onSuccess: () => router.push(ROUTES.projects),
  });

  const form = useForm({
    defaultValues: {
      name: project.name,
      domains: project.domains as string[],
    },
    validators: { onSubmit: projectFormSchema },
    onSubmit: ({ value }) => {
      updateMutation.mutate({ name: value.name, domains: value.domains });
    },
  });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Project",
      description: `This will permanently delete "${project.name}" and all its API keys and generated images. This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
      confirmationText: project.name,
      confirmationHint: (
        <Typography variant="body2Muted">
          Type <strong>{project.name}</strong> to confirm.
        </Typography>
      ),
    });

    if (confirmed) {
      deleteMutation.mutate(undefined as never);
    }
  };

  return (
    <>
      {/* Settings form */}
      <Box>
        <SectionHeader title="Settings" />
        <Surface sx={{ mt: 2 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <Stack spacing={3}>
              <FormTextField
                form={form as unknown as AnyReactForm}
                name="name"
                label="Project Name"
                required
              />
              <FormDomainField form={form as unknown as AnyReactForm} name="domains" />
              <Box>
                <Button type="submit" variant="contained" loading={updateMutation.isPending}>
                  Save Changes
                </Button>
              </Box>
            </Stack>
          </form>
        </Surface>
      </Box>

      {/* Danger Zone */}
      <Box>
        <SectionHeader title="Danger Zone" />
        <Surface sx={{ mt: 2, borderColor: "error.main" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Delete this project
              </Typography>
              <Typography variant="body2Muted">
                Permanently remove this project, its API keys, and all generated images.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              Delete Project
            </Button>
          </Stack>
        </Surface>
      </Box>
    </>
  );
}
