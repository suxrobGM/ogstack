import { client } from "@/lib/api/client";

/**
 * Authenticated download of an image bundle. The API download route is behind
 * the auth guard, so we use the Eden Treaty client (same auth flow + cookie
 * handling as the rest of the app). The endpoint returns a Blob whose
 * Content-Disposition header carries the filename.
 */
export async function downloadImage(imageId: string, fallbackName = "image"): Promise<void> {
  const { data, error, response } = await client.api.images({ id: imageId }).download.get();
  if (error) {
    throw new Error(`Download failed (${error.status})`);
  }

  const blob = data instanceof Blob ? data : new Blob([data as BlobPart]);
  const filename = parseFilename(response.headers.get("content-disposition")) ?? fallbackName;

  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function parseFilename(header: string | null): string | null {
  if (!header) return null;
  const match = /filename="?([^";]+)"?/i.exec(header);
  return match ? match[1]! : null;
}
