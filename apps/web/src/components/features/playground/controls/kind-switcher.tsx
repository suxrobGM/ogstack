"use client";

import type { MouseEvent, ReactElement } from "react";
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { IMAGE_KINDS, type ImageKind } from "@ogstack/shared";
import { useRouter, useSearchParams } from "next/navigation";
import type { AnyReactForm } from "@/components/ui/form/types";
import { IMAGE_KIND_LABELS } from "../schema";

interface KindSwitcherProps {
  form: AnyReactForm;
}

function defaultTemplateForKind(kind: ImageKind): string {
  switch (kind) {
    case "blog_hero":
      return "hero_editorial";
    case "icon_set":
      return "icon_default";
    case "og":
    default:
      return "gradient_dark";
  }
}

export function KindSwitcher(props: KindSwitcherProps): ReactElement {
  const { form } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleKindChange = (_event: MouseEvent<HTMLElement>, next: ImageKind | null) => {
    if (!next) {
      return;
    }

    form.setFieldValue("kind", next);
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
    <form.Subscribe selector={(s: { values: { kind: ImageKind } }) => s.values.kind}>
      {(kind: ImageKind) => (
        <Stack spacing={1}>
          <Typography
            variant="captionMuted"
            sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Image kind
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={kind}
            onChange={handleKindChange}
          >
            {IMAGE_KINDS.map((option) => (
              <ToggleButton key={option} value={option}>
                {IMAGE_KIND_LABELS[option]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      )}
    </form.Subscribe>
  );
}
