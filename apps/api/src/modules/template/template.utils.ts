import { logger } from "@/common/logger";

const FETCH_TIMEOUT_MS = 5_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const SUPPORTED_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

/**
 * Fetches an external image and returns it as a data URL, or `null` on any
 * failure. Satori + resvg panic (`geom.rs` Option::unwrap on None) when an
 * `<img>` inside a transformed or clipped parent resolves to an unreadable
 * source, so templates must never pass a raw remote URL that might 404, time
 * out, or return an unsupported format.
 */
export async function safeFetchImageDataUrl(
  url: string | null | undefined,
): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:")) return url;

  try {
    const protocol = new URL(url).protocol;
    if (protocol !== "http:" && protocol !== "https:") return null;
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;

    const rawContentType = response.headers.get("content-type") ?? "";
    const contentType = rawContentType.split(";")[0]?.trim().toLowerCase() ?? "";
    if (!SUPPORTED_CONTENT_TYPES.has(contentType)) return null;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) return null;

    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    logger.warn({ url, err: (error as Error).message }, "Skipping template image — fetch failed");
    return null;
  } finally {
    clearTimeout(timer);
  }
}
