import type { OGAuditResult, OGIssue } from '@ogstack/shared';
import { validateUrl } from '@ogstack/shared';

const RECOMMENDED_WIDTH = 1200;
const RECOMMENDED_HEIGHT = 630;

export async function validateOGTags(url: string): Promise<OGAuditResult> {
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(`SSRF protection: ${validation.reason}`);
  }

  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const html = await res.text();

  const ogTags = extractOGTags(html);
  const issues: OGIssue[] = [];

  // Check required tags
  if (!ogTags['og:title']) {
    issues.push({ code: 'MISSING_OG_TITLE', severity: 'error', message: 'Missing og:title tag' });
  }
  if (!ogTags['og:description']) {
    issues.push({ code: 'MISSING_OG_DESCRIPTION', severity: 'warning', message: 'Missing og:description tag' });
  }
  if (!ogTags['og:image']) {
    issues.push({ code: 'MISSING_OG_IMAGE', severity: 'error', message: 'Missing og:image tag' });
  }

  let imageWidth: number | null = null;
  let imageHeight: number | null = null;

  // Check image dimensions if available
  if (ogTags['og:image:width']) {
    imageWidth = parseInt(ogTags['og:image:width'], 10);
    if (imageWidth < RECOMMENDED_WIDTH) {
      issues.push({
        code: 'IMAGE_WIDTH_TOO_SMALL',
        severity: 'warning',
        message: `og:image:width is ${imageWidth}px, recommended is ${RECOMMENDED_WIDTH}px`,
      });
    }
  }
  if (ogTags['og:image:height']) {
    imageHeight = parseInt(ogTags['og:image:height'], 10);
    if (imageHeight < RECOMMENDED_HEIGHT) {
      issues.push({
        code: 'IMAGE_HEIGHT_TOO_SMALL',
        severity: 'warning',
        message: `og:image:height is ${imageHeight}px, recommended is ${RECOMMENDED_HEIGHT}px`,
      });
    }
  }

  const status = issues.some((i) => i.severity === 'error')
    ? 'fail'
    : issues.length > 0
      ? 'warning'
      : 'pass';

  return { url, status, issues, existingTags: ogTags, imageWidth, imageHeight };
}

function extractOGTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const matches = html.matchAll(
    /<meta\s+(?:property|name)="(og:[^"]+)"\s+content="([^"]*)"[^>]*>/gi,
  );
  for (const [, property, content] of matches) {
    if (property && content !== undefined) {
      tags[property] = content;
    }
  }
  return tags;
}
