# OGStack — PRD Summary

> Full PRD: `docs/prd.md`

## Product

OGStack is a developer-first API platform for generating beautiful Open Graph images **powered by AI that reads your page content**. A single meta tag or API call → contextual, on-brand social preview images with zero design effort.

- **Domain**: ogstack.dev | **API**: api.ogstack.dev | **CDN**: cdn.ogstack.dev

## AI Features (Shipped)

All three AI capabilities are production and gated by plan tier:

- **Content-aware AI image generation** — Scrape → LLM page analysis → Flux-powered render. The LLM extracts headline, tagline, topics, tone, and mood; the image model renders with legible on-image typography. Standard quality on Free/Plus; Pro quality (with a sub-cap) on Pro.
- **AI audit recommendations** — Score any URL 0–100 across OG, Twitter card, and SEO hygiene, then produce suggested tag rewrites, tone assessment, CTR tips, and content-gap flags. Free tier: scoring only (no AI rewrites). Plus/Pro: AI rewrites included, metered.
- **AI page analysis** — Structured extraction of headline, tagline, summary, topics, content type, language, suggested accent, and mood. Cached 24h per URL; reused by both image generation and audit recommendations to avoid double LLM spend.

## API Modes

### GET (Meta Tag Mode) — Public, no API key

```html
<meta
  property="og:image"
  content="https://api.ogstack.dev/og/{publicProjectId}?url={pageUrl}&template=gradient_dark"
/>
```

Parameters: `url`, `template`, `accent`, `dark`, `aiGenerated`, `aiPrompt`, `font`, `logoUrl`, `logoPosition`

When `aiGenerated=true`, the endpoint runs page analysis through the configured LLM provider and hands the extracted seeds (headline, tagline, background keywords, mood) to the image model. Results are cached per `(projectId, url, template, options, aiModel, watermark)` for 24h.

The public endpoint enforces the project's allowed-domain list against the request URL's hostname. In `NODE_ENV=development`, localhost hostnames bypass the check. Rate limits are applied per-`publicId` at the project owner's plan tier.

### POST (Programmatic Mode) — Requires API key

```text
POST https://api.ogstack.dev/v1/generate
Authorization: Bearer {apiKey}
Body: { url, template, projectId, options: {...}, override?: boolean }
```

Returns 409 `IMAGE_EXISTS` when another image already exists for the same `(projectId, url)` pair with different options. Pass `override: true` to replace it.

## Auth Model

- **GET endpoint**: Public project ID (safe to expose in HTML meta tags), domain-verified
- **POST endpoint**: Secret API key via Bearer header
- **Dashboard**: Email/password, GitHub OAuth, Google OAuth

## Templates

gradient_dark, gradient_light, split_hero, centered_bold, blog_card, docs_page, product_launch, changelog, github_repo, minimal — all 10 available on every tier, each optionally AI-enhanced via `aiGenerated=true`.

## Data Model (Key Entities)

- **User**: id, email, name, role (USER/ADMIN/SUPER_ADMIN), plan (FREE/PLUS/PRO), stripeCustomerId
- **Project**: id, userId, publicId (unique), name, domains[] (required, min 1)
- **ApiKey**: id, projectId, userId, keyHash, prefix, name
- **Image**: id, projectId, cacheKey, cdnUrl, r2Key, template, metadata, `generatedOnPlan`
- **UsageRecord**: id, userId, projectId, period, imageCount, `aiImageCount`, `aiProImageCount`, `aiAuditCount`, cacheHits
- **Subscription**: stripeSubscriptionId, status, currentPeriodEnd, cancelAtPeriodEnd, isComp

## Pricing Tiers

| Tier | Price  | Non-AI images | AI images/mo                    | AI audits/mo | Watermark | Projects  | Domains/proj | Rate (/min) |
| ---- | ------ | ------------- | ------------------------------- | ------------ | --------- | --------- | ------------ | ----------- |
| Free | $0     | Unlimited     | 3 (Flux 2)                      | —            | Yes       | 1         | 1            | 20          |
| Plus | $10/mo | Unlimited     | 100 (Flux 2)                    | 100          | Yes       | 5         | 3            | 100         |
| Pro  | $30/mo | Unlimited     | 1,000 (300 Flux 2 Pro + Flux 2) | 1,000        | No        | Unlimited | Unlimited    | 500         |

Promotion codes (created in Stripe) are supported via the checkout input or pre-applied via `promotionCode` on the checkout request.

### Tier enforcement rules

- **Non-AI images are unmetered** — rendering cost is trivial, cache absorbs repeats.
- **AI images** are capped per-tier; Flux 2 Pro has a sub-cap on the Pro tier (300 of the 1,000 total).
- **Generated images are tier-stamped** (`Image.generatedOnPlan`). After downgrade, the public `/og/:publicId` endpoint returns 402 `TIER_LOCKED` for images generated on a higher tier; gallery UI shows them as locked.
- **Downgrades are end-of-period**. Downgrading to FREE uses `cancel_at_period_end`; downgrading PRO→PLUS uses a Stripe `subscription_schedule`. User retains current tier until the period rolls.

## Performance Targets

- Template rendering: < 500ms p95
- AI-enhanced: < 8s p95
- CDN cache hit ratio: > 90%

## Security Requirements

- SSRF protection on URL scraping (block private IPs)
- API keys hashed before storage
- Domains mandatory on projects; runtime-validated on every public OG request (localhost exempt in dev)
- Rate limiting tiered by plan (per-user, per-API-key, per-publicId)
- Content moderation on AI-generated images

## Dashboard Pages

Overview, Projects, API Keys, Images Gallery, Playground, Audit, Analytics, Settings, Billing

## Admin Panel

User management, subscription management, audit logs. Role-based (ADMIN only).

## Tech Stack

| Layer              | Technology                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| API                | ElysiaJS (Bun)                                                                                                              |
| Frontend           | Next.js 16 + MUI 9                                                                                                          |
| Database           | PostgreSQL + Prisma 7                                                                                                       |
| DI                 | tsyringe                                                                                                                    |
| Template Rendering | Satori + @resvg/resvg-js                                                                                                    |
| AI Image Gen       | Flux 2 / Flux 2 Pro (FAL.ai)                                                                                                |
| LLM                | Pluggable prompt providers (DeepSeek, Anthropic, OpenAI-compatible, Ollama, llama.cpp) — selected via `PROMPT_PROVIDER` env |
| CDN                | Cloudflare R2 + CDN                                                                                                         |
| Payments           | Stripe                                                                                                                      |
