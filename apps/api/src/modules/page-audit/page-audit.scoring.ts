import type { UrlMetadata } from "@/common/services/scraper";
import type { IssueCategory, IssueSeverity, PageAuditIssue } from "./page-audit.schema";

interface CheckResult {
  pass: boolean;
  message: string;
  fix: string;
}

interface Check {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  weight: number;
  title: string;
  run: (m: UrlMetadata) => CheckResult;
}

interface ScoringResult {
  overall: number;
  byCategory: { og: number; twitter: number; seo: number };
  letterGrade: string;
}

const pass = (message: string, fix = ""): CheckResult => ({ pass: true, message, fix });
const fail = (message: string, fix: string): CheckResult => ({ pass: false, message, fix });

function isHttps(metadata: UrlMetadata): boolean {
  return metadata.url.startsWith("https://");
}

/**
 * Extracts the types of structured data entities present in the page's JSON-LD.
 */
export function structuredDataTypes(metadata: UrlMetadata): string[] {
  const types: string[] = [];
  for (const entity of metadata.jsonLd) {
    if (entity.type && !types.includes(entity.type)) types.push(entity.type);
  }
  return types;
}

export const CHECKS: Check[] = [
  // --- OG ---
  {
    id: "og.title",
    category: "og",
    severity: "critical",
    weight: 8,
    title: "og:title present",
    run: (m) =>
      m.ogTitle
        ? pass("og:title is set.")
        : fail(
            "Missing og:title — social platforms will fall back to the page <title>.",
            `Add <meta property="og:title" content="Your page title"> in <head>.`,
          ),
  },
  {
    id: "og.description",
    category: "og",
    severity: "critical",
    weight: 8,
    title: "og:description present",
    run: (m) =>
      m.ogDescription
        ? pass("og:description is set.")
        : fail(
            "Missing og:description — previews will have no subtitle text.",
            `Add <meta property="og:description" content="A compelling 1-2 sentence summary">.`,
          ),
  },
  {
    id: "og.image",
    category: "og",
    severity: "critical",
    weight: 10,
    title: "og:image present",
    run: (m) =>
      m.ogImage
        ? pass("og:image is set.")
        : fail(
            "Missing og:image — social shares will show no preview image.",
            `Add <meta property="og:image" content="https://yoursite.com/og.png"> (1200x630 recommended).`,
          ),
  },
  {
    id: "og.image.dimensions",
    category: "og",
    severity: "warning",
    weight: 5,
    title: "og:image dimensions ≥ 1200×630",
    run: (m) => {
      if (!m.ogImage) return pass("Skipped (no image).");
      if (!m.ogImageWidth || !m.ogImageHeight)
        return fail(
          "og:image:width and og:image:height are not declared.",
          `Add <meta property="og:image:width" content="1200"> and <meta property="og:image:height" content="630">.`,
        );
      if (m.ogImageWidth < 1200 || m.ogImageHeight < 630)
        return fail(
          `og:image is ${m.ogImageWidth}×${m.ogImageHeight} — below the 1200×630 minimum.`,
          "Regenerate the OG image at 1200×630 pixels or larger (2:1 aspect).",
        );
      return pass(`${m.ogImageWidth}×${m.ogImageHeight} meets the 1200×630 minimum.`);
    },
  },
  {
    id: "og.type",
    category: "og",
    severity: "info",
    weight: 2,
    title: "og:type declared",
    run: (m) =>
      m.ogType
        ? pass(`og:type is "${m.ogType}".`)
        : fail(
            "og:type is missing.",
            `Add <meta property="og:type" content="website"> (or "article" for blog posts).`,
          ),
  },
  {
    id: "og.url",
    category: "og",
    severity: "info",
    weight: 2,
    title: "og:url declared",
    run: (m) =>
      m.ogUrl
        ? pass("og:url is set.")
        : fail(
            "og:url is missing — canonical sharing URL is unknown.",
            `Add <meta property="og:url" content="${m.url}">.`,
          ),
  },
  {
    id: "og.site_name",
    category: "og",
    severity: "info",
    weight: 2,
    title: "og:site_name declared",
    run: (m) =>
      m.ogSiteName
        ? pass(`Site name: "${m.ogSiteName}".`)
        : fail(
            "og:site_name is missing.",
            `Add <meta property="og:site_name" content="Your Brand">.`,
          ),
  },

  // --- Twitter ---
  {
    id: "twitter.card",
    category: "twitter",
    severity: "critical",
    weight: 6,
    title: "twitter:card declared",
    run: (m) =>
      m.twitterCard
        ? pass(`twitter:card is "${m.twitterCard}".`)
        : fail(
            "Missing twitter:card — Twitter/X will fall back to a plain link.",
            `Add <meta name="twitter:card" content="summary_large_image">.`,
          ),
  },
  {
    id: "twitter.card.large",
    category: "twitter",
    severity: "warning",
    weight: 3,
    title: "twitter:card uses summary_large_image",
    run: (m) => {
      if (!m.twitterCard) return pass("Skipped (no twitter:card).");
      return m.twitterCard === "summary_large_image"
        ? pass("Using summary_large_image.")
        : fail(
            `twitter:card is "${m.twitterCard}" — consider summary_large_image for full-width images.`,
            `Change to <meta name="twitter:card" content="summary_large_image">.`,
          );
    },
  },
  {
    id: "twitter.title",
    category: "twitter",
    severity: "warning",
    weight: 3,
    title: "twitter:title declared",
    run: (m) =>
      m.twitterTitle || m.ogTitle
        ? pass("Twitter title resolved (falls back to og:title).")
        : fail(
            "No twitter:title and no og:title fallback.",
            `Add <meta name="twitter:title" content="Your title">.`,
          ),
  },
  {
    id: "twitter.description",
    category: "twitter",
    severity: "warning",
    weight: 3,
    title: "twitter:description declared",
    run: (m) =>
      m.twitterDescription || m.ogDescription
        ? pass("Twitter description resolved.")
        : fail(
            "No twitter:description or og:description fallback.",
            `Add <meta name="twitter:description" content="Short summary">.`,
          ),
  },
  {
    id: "twitter.image",
    category: "twitter",
    severity: "warning",
    weight: 4,
    title: "twitter:image declared",
    run: (m) =>
      m.twitterImage || m.ogImage
        ? pass("Twitter image resolved.")
        : fail(
            "No twitter:image or og:image fallback.",
            `Add <meta name="twitter:image" content="https://yoursite.com/og.png">.`,
          ),
  },

  // --- SEO ---
  {
    id: "seo.title",
    category: "seo",
    severity: "critical",
    weight: 6,
    title: "<title> tag with good length",
    run: (m) => {
      if (!m.title) return fail("Missing <title> tag.", "Add a <title> in <head>.");
      const len = m.title.length;
      if (len < 10)
        return fail(
          `Title is too short (${len} chars).`,
          "Aim for 10–60 characters — concise but descriptive.",
        );
      if (len > 60)
        return fail(
          `Title is too long (${len} chars) — search results truncate after ~60.`,
          "Shorten to 60 characters or fewer.",
        );
      return pass(`"${m.title}" (${len} chars).`);
    },
  },
  {
    id: "seo.description",
    category: "seo",
    severity: "warning",
    weight: 5,
    title: "Meta description with good length",
    run: (m) => {
      if (!m.description)
        return fail(
          "Missing meta description.",
          `Add <meta name="description" content="A 50-160 character summary">.`,
        );
      const len = m.description.length;
      if (len < 50)
        return fail(`Description is too short (${len} chars).`, "Aim for 50–160 characters.");
      if (len > 160)
        return fail(
          `Description is too long (${len} chars).`,
          "Trim to 160 characters or fewer to avoid SERP truncation.",
        );
      return pass(`${len} chars.`);
    },
  },
  {
    id: "seo.canonical",
    category: "seo",
    severity: "warning",
    weight: 4,
    title: "Canonical URL",
    run: (m) =>
      m.canonicalUrl
        ? pass("Canonical URL is set.")
        : fail(
            'Missing <link rel="canonical">.',
            `Add <link rel="canonical" href="${m.url}"> to avoid duplicate-content issues.`,
          ),
  },
  {
    id: "seo.lang",
    category: "seo",
    severity: "info",
    weight: 2,
    title: "<html lang> attribute",
    run: (m) =>
      m.lang
        ? pass(`lang="${m.lang}".`)
        : fail(
            "<html> element has no lang attribute.",
            `Add lang="en" (or your page language) to the <html> tag.`,
          ),
  },
  {
    id: "seo.viewport",
    category: "seo",
    severity: "critical",
    weight: 4,
    title: "Viewport meta (mobile-friendly)",
    run: (m) =>
      m.hasViewport
        ? pass("Viewport meta present.")
        : fail(
            "No viewport meta — the page will render desktop-width on mobile.",
            `Add <meta name="viewport" content="width=device-width, initial-scale=1">.`,
          ),
  },
  {
    id: "seo.charset",
    category: "seo",
    severity: "info",
    weight: 1,
    title: "Charset declared",
    run: (m) =>
      m.hasCharset
        ? pass("Charset declared.")
        : fail(
            "No <meta charset> — may cause encoding issues.",
            `Add <meta charset="UTF-8"> as the first element in <head>.`,
          ),
  },
  {
    id: "seo.favicon",
    category: "seo",
    severity: "info",
    weight: 2,
    title: "Favicon link",
    run: (m) =>
      m.favicon
        ? pass("Favicon resolved.")
        : fail("No explicit favicon link.", `Add <link rel="icon" href="/favicon.ico">.`),
  },
  {
    id: "seo.h1",
    category: "seo",
    severity: "warning",
    weight: 3,
    title: "Exactly one <h1>",
    run: (m) => {
      if (m.h1Count === 0)
        return fail("Page has no <h1>.", "Add a single <h1> with the page's main heading.");
      if (m.h1Count > 1)
        return fail(
          `Page has ${m.h1Count} <h1> elements.`,
          "Use one <h1> per page; downgrade secondary headings to <h2>.",
        );
      return pass("Exactly one <h1>.");
    },
  },
  {
    id: "seo.structured_data",
    category: "seo",
    severity: "info",
    weight: 3,
    title: "Structured data (JSON-LD)",
    run: (m) => {
      const types = structuredDataTypes(m);
      return types.length > 0
        ? pass(`JSON-LD structured data detected (${types.slice(0, 3).join(", ")}).`)
        : fail(
            "No JSON-LD structured data.",
            "Add a schema.org JSON-LD block (e.g. Article, WebSite, Product) to unlock rich results.",
          );
    },
  },
  {
    id: "seo.robots",
    category: "seo",
    severity: "critical",
    weight: 4,
    title: "Not blocking indexers",
    run: (m) => {
      if (!m.robots) return pass("No robots meta — default is indexable.");
      if (/noindex/i.test(m.robots))
        return fail(
          `robots meta is "${m.robots}" — search engines will skip this page.`,
          "Remove the noindex directive if you want search traffic.",
        );
      return pass(`robots="${m.robots}".`);
    },
  },
  {
    id: "seo.https",
    category: "seo",
    severity: "warning",
    weight: 3,
    title: "Served over HTTPS",
    run: (m) =>
      isHttps(m)
        ? pass("Page is HTTPS.")
        : fail(
            "Page is not HTTPS — many social platforms downrank or reject insecure previews.",
            "Serve the site over HTTPS with a valid TLS certificate.",
          ),
  },
  {
    id: "seo.alt",
    category: "seo",
    severity: "info",
    weight: 2,
    title: "Images have alt text",
    run: (m) => {
      if (m.imageCount === 0) return pass("No images to check.");
      if (m.imagesMissingAlt === 0) return pass(`All ${m.imageCount} images have alt text.`);
      return fail(
        `${m.imagesMissingAlt} of ${m.imageCount} images missing alt text.`,
        "Add descriptive alt attributes to every <img> (accessibility + SEO).",
      );
    },
  },
];

export function runChecks(meta: UrlMetadata): PageAuditIssue[] {
  return CHECKS.map((check) => {
    const result = check.run(meta);
    return {
      id: check.id,
      category: check.category,
      severity: check.severity,
      pass: result.pass,
      title: check.title,
      message: result.message,
      fix: result.fix,
    };
  });
}

export function computeScore(issues: PageAuditIssue[]): ScoringResult {
  const earned: Record<IssueCategory, number> = { og: 0, twitter: 0, seo: 0 };
  const possible: Record<IssueCategory, number> = { og: 0, twitter: 0, seo: 0 };
  let totalEarned = 0;
  let totalPossible = 0;

  for (const check of CHECKS) {
    const issue = issues.find((i) => i.id === check.id);
    if (!issue) continue;
    possible[check.category] += check.weight;
    totalPossible += check.weight;
    if (issue.pass) {
      earned[check.category] += check.weight;
      totalEarned += check.weight;
    }
  }

  const overall = totalPossible === 0 ? 0 : Math.round((totalEarned / totalPossible) * 100);

  return {
    overall,
    byCategory: {
      og: possible.og === 0 ? 0 : Math.round((earned.og / possible.og) * 100),
      twitter: possible.twitter === 0 ? 0 : Math.round((earned.twitter / possible.twitter) * 100),
      seo: possible.seo === 0 ? 0 : Math.round((earned.seo / possible.seo) * 100),
    },
    letterGrade: toLetterGrade(overall),
  };
}

export function toLetterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
