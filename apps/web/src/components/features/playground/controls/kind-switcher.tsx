"use client";

import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import { IMAGE_KINDS, type ImageKind } from "@ogstack/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { FormToggleField } from "@/components/ui/form";
import type { AnyReactForm } from "@/components/ui/form/types";
import { IMAGE_KIND_LABELS } from "@/types/image-kinds";

interface KindSwitcherProps {
  form: AnyReactForm;
}

function defaultTemplateForKind(kind: ImageKind): string {
  switch (kind) {
    case "icon_set":
      return "icon_default";
    case "og":
    case "blog_hero":
    default:
      return "editorial";
  }
}

const KIND_ITEMS = IMAGE_KINDS.map((value) => ({
  value,
  label: IMAGE_KIND_LABELS[value],
}));

export function KindSwitcher(props: KindSwitcherProps): ReactElement {
  const { form } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleKindChange = (next: ImageKind): void => {
    // Reset template to the kind's default on switch.
    form.setFieldValue("template", defaultTemplateForKind(next));
    // Sync the URL so deep links + in-page state stay consistent.
    const params = new URLSearchParams(searchParams.toString());
    if (next === "og") {
      params.delete("kind");
    } else {
      params.set("kind", next);
    }
    params.delete("template");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  return (
    <Stack spacing={1}>
      <Typography
        variant="captionMuted"
        sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        Image kind
      </Typography>
      <FormToggleField
        form={form}
        name="kind"
        items={KIND_ITEMS}
        fullWidth
        onChange={handleKindChange}
      />
    </Stack>
  );
}
