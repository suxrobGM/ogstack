"use client";

import { useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { PageAnalysisResponse } from "@/types/api";

interface UsePageAnalysisOptions {
  url: string;
  userPrompt?: string;
  fullOverride?: boolean;
  enabled?: boolean;
}

export function usePageAnalysis(options: UsePageAnalysisOptions) {
  const { url, userPrompt = "", fullOverride = false, enabled = true } = options;
  const isValid = isValidUrl(url);

  return useApiQuery<PageAnalysisResponse>(
    queryKeys.pageAnalysis.analyze({ url, userPrompt, fullOverride }),
    () =>
      client.api["page-analysis"].analyze.post({
        url,
        userPrompt: userPrompt || undefined,
        fullOverride: fullOverride,
      }),
    {
      enabled: enabled && isValid,
      staleTime: 1000 * 60 * 5,
      retry: false,
    },
  );
}

function isValidUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
