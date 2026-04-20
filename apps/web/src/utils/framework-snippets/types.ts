export type FrameworkId =
  | "html"
  | "nextjs"
  | "nuxt"
  | "astro"
  | "sveltekit"
  | "remix"
  | "vue"
  | "react"
  | "angular";

export interface FrameworkSnippet {
  id: FrameworkId;
  label: string;
  language: string;
  code: string;
}

export interface FaviconUrls {
  faviconIco?: string;
  favicon16?: string;
  favicon32?: string;
  appleTouchIcon?: string;
  icon192?: string;
  icon512?: string;
  manifest?: string;
}

/**
 * Per-framework code generator. Each framework file (html.ts, nextjs.ts, …)
 * exports a single FrameworkPlugin that the index aggregates.
 */
export interface FrameworkPlugin {
  id: FrameworkId;
  label: string;
  language: string;
  buildOg: (url: string) => string;
  buildFavicon: (urls: FaviconUrls) => string;
}

export function indent(line: string, spaces: number): string {
  return " ".repeat(spaces) + line;
}
