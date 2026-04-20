"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/constants";

interface UseOgPreviewResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  generated: { url: string; template: string } | null;
  generate: (url: string, template: string) => Promise<void>;
}

/**
 * Custom hook to generate OG image previews for the landing page playground.
 */
export function useOgPreview(publicId: string | undefined): UseOgPreviewResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{ url: string; template: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const generate = async (url: string, template: string): Promise<void> => {
    if (!publicId) return;

    setError(null);
    setIsLoading(true);
    setGenerated({ url, template });

    if (imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl(null);

    const query = new URLSearchParams({ url, template });
    const endpoint = `${API_BASE_URL}/api/og/${publicId}?${query.toString()}`;

    try {
      const response = await fetch(endpoint, { cache: "no-store" });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: unknown } | null;
        const message =
          typeof body?.message === "string"
            ? body.message
            : `Preview generation failed (${response.status})`;
        setError(message);
        setGenerated(null);
        return;
      }

      const blob = await response.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch {
      setError("Couldn't reach the image service. Check your connection and try again.");
      setGenerated(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { imageUrl, isLoading, error, generated, generate };
}
