import { validateUrl } from '@ogstack/shared';

export interface CrawlResult {
  urls: string[];
  source: 'sitemap' | 'links' | 'manual';
}

export async function crawlSite(siteUrl: string, maxUrls = 50): Promise<CrawlResult> {
  const validation = validateUrl(siteUrl);
  if (!validation.valid) {
    throw new Error(`SSRF protection: ${validation.reason}`);
  }

  // Try sitemap first
  const sitemapUrls = await trySitemap(siteUrl);
  if (sitemapUrls.length > 0) {
    return { urls: sitemapUrls.slice(0, maxUrls), source: 'sitemap' };
  }

  // Fall back to link crawling
  const linkUrls = await crawlLinks(siteUrl, maxUrls);
  return { urls: linkUrls, source: 'links' };
}

async function trySitemap(siteUrl: string): Promise<string[]> {
  const base = new URL(siteUrl).origin;
  const sitemapUrl = `${base}/sitemap.xml`;

  const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(10_000) }).catch(
    () => null,
  );
  if (!res?.ok) return [];

  const xml = await res.text();
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
  return [...matches].map((m) => m[1] ?? '').filter(Boolean);
}

async function crawlLinks(startUrl: string, maxUrls: number): Promise<string[]> {
  const base = new URL(startUrl).origin;
  const visited = new Set<string>();
  const queue = [startUrl];
  const results: string[] = [];

  while (queue.length > 0 && results.length < maxUrls) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) }).catch(
      () => null,
    );
    if (!res?.ok) continue;

    results.push(url);
    const html = await res.text();
    const links = html.matchAll(/href="([^"]+)"/g);
    for (const [, href] of links) {
      if (!href) continue;
      try {
        const absolute = new URL(href, base).href;
        if (absolute.startsWith(base) && !visited.has(absolute)) {
          queue.push(absolute);
        }
      } catch {
        // ignore malformed hrefs
      }
    }
  }

  return results;
}
