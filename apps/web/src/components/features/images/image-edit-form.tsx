"use client";

import { useEffect, type ReactElement } from "react";
import { Button, Stack } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { ImageItem } from "@/types/api";
import { imageEditFormSchema, type ImageEditFormValues } from "./schema";

interface ImageEditFormProps {
  image: ImageItem;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ImageEditForm(props: ImageEditFormProps): ReactElement {
  const { image, onCancel, onSuccess } = props;

  const mutation = useApiMutation(
    (body: ImageEditFormValues) => client.api.images({ id: image.id }).patch(body),
    {
      successMessage: "Image updated.",
      invalidateKeys: [queryKeys.images.all],
      onSuccess,
    },
  );

  const form = useForm({
    defaultValues: {
      title: image.title ?? "",
      description: image.description ?? "",
    } as ImageEditFormValues,
    validators: { onSubmit: imageEditFormSchema },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        title: value.title?.trim() ? value.title : undefined,
        description: value.description?.trim() ? value.description : undefined,
      });
    },
  });

  useEffect(() => {
    form.reset({ title: image.title ?? "", description: image.description ?? "" });
  }, [image.id]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Stack spacing={2}>
        <FormTextField form={form} name="title" label="Title" />
        <FormTextField form={form} name="description" label="Description" multiline minRows={3} />
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" loading={mutation.isPending}>
            Save
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
