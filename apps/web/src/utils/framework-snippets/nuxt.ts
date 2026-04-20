import { indent, type FrameworkPlugin } from "./types";

export const nuxtPlugin: FrameworkPlugin = {
  id: "nuxt",
  label: "Nuxt 4",
  language: "vue",
  buildOg(url) {
    return `<script setup lang="ts">
useSeoMeta({
  ogImage: "${url}",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: "summary_large_image",
});
</script>`;
  },
  buildFavicon(u) {
    const links: string[] = [];
    if (u.faviconIco) links.push(`{ rel: "icon", href: "${u.faviconIco}", sizes: "any" }`);
    if (u.favicon16)
      links.push(`{ rel: "icon", type: "image/png", sizes: "16x16", href: "${u.favicon16}" }`);
    if (u.favicon32)
      links.push(`{ rel: "icon", type: "image/png", sizes: "32x32", href: "${u.favicon32}" }`);
    if (u.appleTouchIcon)
      links.push(`{ rel: "apple-touch-icon", sizes: "180x180", href: "${u.appleTouchIcon}" }`);
    if (u.icon192)
      links.push(`{ rel: "icon", type: "image/png", sizes: "192x192", href: "${u.icon192}" }`);
    if (u.icon512)
      links.push(`{ rel: "icon", type: "image/png", sizes: "512x512", href: "${u.icon512}" }`);
    if (u.manifest) links.push(`{ rel: "manifest", href: "${u.manifest}" }`);

    return `<script setup lang="ts">
useHead({
  link: [
${links.map((l) => indent(l, 4)).join(",\n")},
  ],
});
</script>`;
  },
};
