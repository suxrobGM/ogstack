"use client";

import type { ReactElement } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, CircularProgress, LinearProgress, Stack, Typography } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { FormTextField } from "@/components/ui/form/form-text-field";
import { Surface } from "@/components/ui/layout/surface";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { radii } from "@/theme";
import type { AuditReportResponse } from "@/types/api";
import { normalizeUrlInput } from "@/utils/url";
import { auditFormSchema, type AuditFormValues } from "./schema";

interface AuditFormProps {
  onSuccess: (report: AuditReportResponse) => void;
  autoFocus?: boolean;
  initialUrl?: string;
}

export function AuditForm(props: AuditFormProps): ReactElement {
  const { onSuccess, autoFocus, initialUrl } = props;

  const mutation = useApiMutation((body: AuditFormValues) => client.api.audit.post(body), {
    errorMessage: (err) => err.message,
    onSuccess: (data) => onSuccess(data as AuditReportResponse),
  });

  const form = useForm({
    defaultValues: { url: initialUrl ?? "" } satisfies AuditFormValues,
    validators: { onSubmit: auditFormSchema },
    onSubmit: ({ value }) => {
      mutation.mutate(value);
    },
  });

  const isPending = mutation.isPending;

  return (
    <Surface variant="expressive" sx={{ position: "relative", overflow: "hidden" }}>
      {isPending && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            borderTopLeftRadius: `${radii.lg}px`,
            borderTopRightRadius: `${radii.lg}px`,
          }}
        />
      )}
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
          autoFocus={autoFocus}
          size="medium"
          disabled={isPending}
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
          {isPending ? "Analyzing…" : "Analyze URL"}
        </Button>
        {isPending && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Fetching the page, parsing metadata, and grading it — usually 3–8 seconds.
            </Typography>
          </Box>
        )}
      </Stack>
    </Surface>
  );
}
