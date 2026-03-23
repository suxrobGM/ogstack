# OGStack — PRD Summary

> Full PRD: `docs/prd.md`

## Product

OGStack is a developer-first API platform for generating beautiful Open Graph images. Single meta tag or API call → contextual social preview images with zero design effort.

- **Domain**: ogstack.dev | **API**: api.ogstack.dev | **CDN**: cdn.ogstack.dev

## API Modes

### GET (Meta Tag Mode) — Public, no API key

```html
<meta
  property="og:image"
  content="https://api.ogstack.dev/og/{publicProjectId}?url={pageUrl}&template=gradient_dark"
/>
```

Parameters: `url`, `template`, `accent`, `dark`, `ai_bg`, `font`, `logo`

### POST (Programmatic Mode) — Requires API key

```text
POST https://api.ogstack.dev/v1/generate
Authorization: Bearer {apiKey}
Body: { url, template, options: { accent, dark, ai_background, font, logo_position } }
```

## Auth Model

- **GET endpoint**: Public project ID (safe to expose in HTML meta tags)
- **POST endpoint**: Secret API key via Bearer header
- **Dashboard**: Email/password, GitHub OAuth, Google OAuth

## Templates (MVP)

gradient_dark, gradient_light, split_hero, centered_bold, blog_card, docs_page, product_launch, changelog, github_repo, minimal

## Data Model (Key Entities)

- **User**: id, email, name, role (USER/ADMIN), plan, stripeCustomerId
- **Project**: id, userId, publicId (unique), name, domains[]
- **ApiKey**: id, projectId, userId, keyHash, prefix, name
- **GeneratedImage**: id, projectId, cacheKey, cdnUrl, r2Key, template, metadata
- **UsageRecord**: id, userId, projectId, period, imageCount

## Pricing Tiers

| Tier       | Price  | Quota     | AI           | Key Features             |
| ---------- | ------ | --------- | ------------ | ------------------------ |
| Free       | $0     | 50/mo     | No           | 5 templates, watermark   |
| Pro        | $12/mo | 500/mo    | Flux Schnell | All templates, Brand Kit |
| Business   | $29/mo | 5,000/mo  | Flux Pro     | A/B testing, analytics   |
| Enterprise | $79/mo | Unlimited | All models   | Custom domain, SLA, SSO  |

## Performance Targets

- Template rendering: < 500ms p95
- AI-enhanced: < 8s p95
- CDN cache hit ratio: > 90%

## Security Requirements

- SSRF protection on URL scraping (block private IPs)
- API keys hashed before storage
- Domain allowlisting for public project IDs
- Rate limiting per API key and project ID
- Content moderation on AI-generated images

## Dashboard Pages

Overview, Projects, API Keys, Templates, Images Gallery, Brand Kit, Settings, Playground

## Admin Panel

User management, subscription management, audit logs. Role-based (ADMIN only).

## Tech Stack

| Layer              | Technology               |
| ------------------ | ------------------------ |
| API                | ElysiaJS (Bun)           |
| Frontend           | Next.js (App Router)     |
| Database           | PostgreSQL + Prisma 7    |
| DI                 | tsyringe                 |
| Template Rendering | Satori + @resvg/resvg-js |
| AI Image Gen       | Flux Schnell (FAL.ai)    |
| CDN                | Cloudflare R2 + CDN      |
| Payments           | Stripe                   |
