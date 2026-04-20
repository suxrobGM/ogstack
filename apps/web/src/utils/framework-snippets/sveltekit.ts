import { faviconHtmlLines } from "./html";
import { indent, type FrameworkPlugin } from "./types";

export const sveltekitPlugin: FrameworkPlugin = {
  id: "sveltekit",
  label: "SvelteKit",
  language: "svelte",
  buildOg(url) {
    return `<svelte:head>
  <meta property="og:image" content="${url}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>`;
  },
  buildFavicon(u) {
    const indented = faviconHtmlLines(u)
      .map((line) => indent(line, 2))
      .join("\n");
    return `<!-- src/routes/+layout.svelte -->
<svelte:head>
${indented}
</svelte:head>`;
  },
};
