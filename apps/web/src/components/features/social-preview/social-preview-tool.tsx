"use client";

import { useState, type ReactElement } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { PlatformPreviewGrid } from "@/components/features/audit/report";
import { FormTextField } from "@/components/ui/form/";
import { Surface } from "@/components/ui/layout";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import type { PageAuditPreviewMetadata } from "@/types/api";
import { normalizeUrlInput } from "@/utils/url";
import { socialPreviewSchema, type SocialPreviewValues } from "./schema";

export function SocialPreviewTool(): ReactElement {
  const [metadata, setMetadata] = useState<PageAuditPreviewMetadata | null>(null);

  const mutation = useApiMutation(
    (body: SocialPreviewValues) => client.api.audits.preview.post(body),
    {
      errorMessage: (err) => err.message,
      onSuccess: (data) => setMetadata(data.metadata),
    },
  );

  const form = useForm({
    defaultValues: { url: "" } as SocialPreviewValues,
    validators: { onSubmit: socialPreviewSchema },
    onSubmit: ({ value }) => mutation.mutate(value),
  });

  const isPending = mutation.isPending;

  return (
    <Stack spacing={3}>
      <Surface variant="expressive" sx={{ maxWidth: 720, width: "100%", mx: "auto" }}>
        <Stack
          component="form"
          spacing={2}
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FormTextField
            form={form}
            name="url"
            label="Page URL"
            placeholder="https://example.com/blog/post"
            transform={normalizeUrlInput}
            size="medium"
            disabled={isPending}
            autoFocus
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={
              isPending ? (
                <CircularProgress size={18} thickness={5} sx={{ color: "inherit" }} />
              ) : (
                <SearchIcon />
              )
            }
            disabled={isPending}
          >
            {isPending ? "Fetching…" : "Preview"}
          </Button>
          <Typography variant="captionMuted">
            Live-fetches OG, Twitter, and favicon metadata. Nothing is saved or cached — every click
            re-scrapes the URL.
          </Typography>
        </Stack>
      </Surface>

      {metadata && <PlatformPreviewGrid metadata={metadata} />}
    </Stack>
  );
}
