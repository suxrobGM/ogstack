import { indent, type FrameworkPlugin } from "./types";

export const nextjsPlugin: FrameworkPlugin = {
  id: "nextjs",
  label: "Next.js",
  language: "tsx",
  buildOg(url) {
    return `// app/layout.tsx (or any route)
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    images: [{ url: "${url}", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["${url}"],
  },
};`;
  },
  buildFavicon(u) {
    const iconEntries: string[] = [];
    if (u.faviconIco) iconEntries.push(`{ url: "${u.faviconIco}", sizes: "any" }`);
    if (u.favicon16)
      iconEntries.push(`{ url: "${u.favicon16}", type: "image/png", sizes: "16x16" }`);
    if (u.favicon32)
      iconEntries.push(`{ url: "${u.favicon32}", type: "image/png", sizes: "32x32" }`);
    if (u.icon192) iconEntries.push(`{ url: "${u.icon192}", type: "image/png", sizes: "192x192" }`);
    if (u.icon512) iconEntries.push(`{ url: "${u.icon512}", type: "image/png", sizes: "512x512" }`);

    const iconBlock =
      iconEntries.length > 0
        ? `    icon: [\n${iconEntries.map((e) => indent(e, 6)).join(",\n")},\n    ],`
        : "";
    const apple = u.appleTouchIcon
      ? `\n    apple: { url: "${u.appleTouchIcon}", sizes: "180x180" },`
      : "";
    const manifest = u.manifest ? `\n  manifest: "${u.manifest}",` : "";

    return `// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
${iconBlock}${apple}
  },${manifest}
};`;
  },
};
