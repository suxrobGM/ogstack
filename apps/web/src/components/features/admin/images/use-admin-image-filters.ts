"use client";

import type { ImageKind } from "@ogstack/shared";
import { useState } from "react";

export type AiFilter = "" | "ai" | "template";

export interface AdminImageFilters {
  search: string;
  userId: string;
  projectId: string;
  kind: ImageKind | "";
  templateSlug: string;
  ai: AiFilter;
  from: string;
  to: string;
}

export interface UseAdminImageFiltersResult {
  filters: AdminImageFilters;
  setFilter: <K extends keyof AdminImageFilters>(key: K, value: AdminImageFilters[K]) => void;
  hasActiveFilters: boolean;
}

const EMPTY_FILTERS: AdminImageFilters = {
  search: "",
  userId: "",
  projectId: "",
  kind: "",
  templateSlug: "",
  ai: "",
  from: "",
  to: "",
};

export function useAdminImageFilters(
  initial: Partial<AdminImageFilters> = {},
): UseAdminImageFiltersResult {
  const [filters, setFilters] = useState<AdminImageFilters>({ ...EMPTY_FILTERS, ...initial });

  const setFilter: UseAdminImageFiltersResult["setFilter"] = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return { filters, setFilter, hasActiveFilters };
}
