import { faviconHtmlLines } from "./html";
import type { FrameworkPlugin } from "./types";

export const astroPlugin: FrameworkPlugin = {
  id: "astro",
  label: "Astro",
  language: "astro",
  buildOg(url) {
    return `---
const ogImage = "${url}";
---
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />`;
  },
  buildFavicon(u) {
    return `---
// src/layouts/Layout.astro (inside <head>)
---
${faviconHtmlLines(u).join("\n")}`;
  },
};
