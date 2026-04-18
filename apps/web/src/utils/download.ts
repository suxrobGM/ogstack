import { API_BASE_URL } from "@/lib/api/constants";
import { fetchWithRefresh } from "@/lib/fetch-with-refresh";

/**
 * Fetches the image data for the given image ID and triggers a download in the browser.
 * The server response must include a `Content-Disposition` header with the filename, or a fallback name will be used.
 */
export async function downloadImage(imageId: string, fallbackName = "image"): Promise<void> {
  const response = await fetchWithRefresh(`${API_BASE_URL}/api/images/${imageId}/download`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
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
