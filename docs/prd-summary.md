# OGStack - PRD Summary

A condensed reference for day-to-day engineering. For the authoritative spec, see [prd.md](prd.md).

## What It Is

OGStack is a developer-first **branded image API** - Open Graph images, blog hero images, and favicon/app icon sets - generated from a URL. A single meta tag or API call produces contextual, on-brand visuals. Template rendering via Satori; optional AI artwork via Flux 2 / Flux 2 Pro grounded in LLM page analysis.

## Two Integration Modes

- **GET `/og/:publicId?url=...`** - no API key, public project ID in path, optional domain allowlist. Meta-tag flow. OG images only.
- **POST `/v1/generate`** - Bearer API key. Supports `kind: og | blog_hero | icon_set`. Returns JSON with `imageUrl` (or `assets[]` for icon sets).

## Output Kinds

| Kind        | Dimensions            | AI        | Output                                   |
| ----------- | --------------------- | --------- | ---------------------------------------- |
| `og`        | 1200×630              | Optional  | Single PNG                               |
| `blog_hero` | 1600×900 or 1920×1080 | Optional  | Single PNG                               |
| `icon_set`  | 16/32/48/180/192/512  | Always on | favicon.ico, PNGs, apple-touch, manifest |

## Pricing (3 tiers)

| Tier | Price  | Non-AI OG+hero | AI renders/mo                  | AI audits/mo | Watermark | Projects  | Domains   | Rate/min |
| ---- | ------ | -------------- | ------------------------------ | ------------ | --------- | --------- | --------- | -------- |
| Free | $0     | Unlimited      | 3 (Flux 2)                     | 3            | Yes       | 1         | 1         | 20       |
| Plus | $10/mo | Unlimited      | 100                            | 100          | Yes       | 5         | 3         | 100      |
| Pro  | $30/mo | Unlimited      | 1,000 (300 Flux 2 Pro sub-cap) | 1,000        | No        | Unlimited | Unlimited | 500      |

Non-AI renders are unmetered on every tier. AI renders of any kind share one cap. Downgrades are end-of-period; images generated on a higher tier return **402 TIER_LOCKED** from the public endpoint after a downgrade.

## Generation Pipeline

1. Resolve project (GET) or API key (POST) → check rate limits + quota
2. Domain allowlist check (GET only, if non-empty)
3. Cache key = `SHA256(projectId + url + kind + template + options + aiModel + watermark)` → cache HIT serves from CDN in <100ms
4. Cache MISS: scrape URL → (AI on) run `PageAnalysisService` for `pageTheme`, `brandHints`, `contentSignals`, `imagePrompt` (24h cache)
5. Dispatch by kind: Satori template, Flux AI render, or Flux+sharp icon pipeline
6. Upload to R2, warm CDN, return image

## AI Page Analysis (shipped)

Every AI image is grounded in scraped page content - no hallucinations, no manual prompting. `suggestedAccent` prefers `themeColor` → `faviconDominant` → LLM inference. Shared cache feeds both AI image generation and AI audit recommendations.

## Core Surfaces

- **Dashboard**: projects, API keys, templates, images gallery, audits, playground, settings
- **Playground**: primary onboarding - paste URL, pick template, copy meta tag
- **OG Score audit tool** (`/audit`): 0–100 score + platform previews + fix recommendations. Viral growth engine.
- **Admin panel**: user/subscription management, plan overrides, bonus quota, suspend, impersonate (read-only). ADMIN role only; all actions logged to `AuditLog`.

## Auth Model

| Use Case            | Method                                     |
| ------------------- | ------------------------------------------ |
| Meta tag (GET)      | Public project ID in URL path              |
| Programmatic (POST) | `Authorization: Bearer og_live_...`        |
| Dashboard           | GitHub OAuth, Google OAuth, email+password |

Auth endpoints protected by reCAPTCHA v3. API keys hashed at rest.

## Caching

| Layer     | TTL        |
| --------- | ---------- |
| CDN edge  | 30 days    |
| R2 origin | Indefinite |
| In-memory | 5 min      |

## Key Models

`User` · `Project` (publicId, domains[]) · `ApiKey` · `Template` · `Image` (kind, cacheKey, generatedOnPlan, assets) · `PageAnalysis` (24h) · `AuditReport` · `UsageRecord` · `Subscription` · `AuditLog`

## Non-Functional Targets

- Template render p95 < 500ms
- AI render p95 < 8s
- Cached serve p95 < 100ms
- 99.9% uptime
- SSRF-protected scraping (blocks private ranges, localhost, link-local)
