import type { ScrapedPageContext } from '@ogstack/shared';
import { validateUrl } from '@ogstack/shared';
import { chromium, type Browser, type Page } from 'playwright';

export async function scrapePage(url: string): Promise<ScrapedPageContext> {
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(`SSRF protection: ${validation.reason}`);
  }

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const page: Page = await browser.newPage();

    await page.setViewportSize({ width: 1200, height: 630 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 });

    const [title, description, headings, bodyText, existingOgTags, faviconUrl] =
      await Promise.all([
        page.title(),
        page.$eval(
          'meta[name="description"]',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (el) => (el as any).content,
        ).catch(() => ''),
        page.$$eval('h1, h2, h3', (els) =>
          els.slice(0, 5).map((el) => el.textContent?.trim() ?? ''),
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        page.$eval('body', (el) => (el as any).innerText.slice(0, 2000)).catch(() => ''),
        page.$$eval('meta[property^="og:"]', (els) =>
          Object.fromEntries(
            els.map((el) => [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (el as any).getAttribute('property') ?? '',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (el as any).content,
            ]),
          ),
        ),
        page.$eval('link[rel="icon"], link[rel="shortcut icon"]', (el) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (el as any).href,
        ).catch(() => null),
      ]);

    return {
      url,
      title,
      description,
      headings,
      bodyText,
      existingOgTags,
      faviconUrl,
      dominantColors: [],
      screenshotBase64: null,
    };
  } finally {
    await browser?.close();
  }
}
