import { faviconHtmlLines } from "./html";
import { indent, type FrameworkPlugin } from "./types";

export const reactPlugin: FrameworkPlugin = {
  id: "react",
  label: "React (Vite)",
  language: "tsx",
  buildOg(url) {
    return `import { Helmet } from "react-helmet-async";

export function PageMeta() {
  return (
    <Helmet>
      <meta property="og:image" content="${url}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}`;
  },
  buildFavicon(u) {
    const indented = faviconHtmlLines(u)
      .map((line) => indent(line, 6))
      .join("\n");
    return `import { Helmet } from "react-helmet-async";

export function PageIcons() {
  return (
    <Helmet>
${indented}
    </Helmet>
  );
}`;
  },
};
