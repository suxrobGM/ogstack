import { faviconHtmlLines } from "./html";
import type { FrameworkPlugin } from "./types";

/**
 * Angular doesn't run JS for crawlers without SSR, so meta tags belong in
 * the static index.html rather than going through the `Meta` service at runtime.
 * For per-page OG images, pair this with Angular Universal (SSR) and template
 * the URL on the server.
 */
export const angularPlugin: FrameworkPlugin = {
  id: "angular",
  label: "Angular",
  language: "html",
  buildOg(url) {
    return `<!-- src/index.html (inside <head>) -->
<meta property="og:image" content="${url}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />`;
  },
  buildFavicon(u) {
    return `<!-- src/index.html (inside <head>) -->
${faviconHtmlLines(u).join("\n")}`;
  },
};
