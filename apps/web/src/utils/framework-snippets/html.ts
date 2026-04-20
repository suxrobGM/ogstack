import type { FaviconUrls, FrameworkPlugin } from "./types";

/** Shared by html, astro, sveltekit, angular — all of them ultimately emit `<link>` tags. */
export function faviconHtmlLines(u: FaviconUrls): string[] {
  const lines: string[] = [];
  if (u.faviconIco) lines.push(`<link rel="icon" href="${u.faviconIco}" sizes="any" />`);
  if (u.favicon16)
    lines.push(`<link rel="icon" type="image/png" sizes="16x16" href="${u.favicon16}" />`);
  if (u.favicon32)
    lines.push(`<link rel="icon" type="image/png" sizes="32x32" href="${u.favicon32}" />`);
  if (u.appleTouchIcon)
    lines.push(`<link rel="apple-touch-icon" sizes="180x180" href="${u.appleTouchIcon}" />`);
  if (u.icon192)
    lines.push(`<link rel="icon" type="image/png" sizes="192x192" href="${u.icon192}" />`);
  if (u.icon512)
    lines.push(`<link rel="icon" type="image/png" sizes="512x512" href="${u.icon512}" />`);
  if (u.manifest) lines.push(`<link rel="manifest" href="${u.manifest}" />`);
  return lines;
}

export const htmlPlugin: FrameworkPlugin = {
  id: "html",
  label: "HTML",
  language: "html",
  buildOg(url) {
    return `<meta property="og:image" content="${url}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />`;
  },
  buildFavicon(u) {
    return faviconHtmlLines(u).join("\n");
  },
};
