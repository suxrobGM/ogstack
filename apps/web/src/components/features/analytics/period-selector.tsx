"use client";

import type { ReactElement } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

export type AnalyticsRange = "30d" | "3m" | "12m" | "all";

const OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

interface PeriodSelectorProps {
  value: AnalyticsRange;
}

export function PeriodSelector(props: PeriodSelectorProps): ReactElement {
  const { value } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (_: unknown, next: AnalyticsRange | null) => {
    if (!next) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next);
    router.replace(`/analytics?${params.toString()}` as Route);
  };

  return (
    <ToggleButtonGroup value={value} exclusive onChange={handleChange} size="small" color="primary">
      {OPTIONS.map((opt) => (
        <ToggleButton key={opt.value} value={opt.value}>
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
