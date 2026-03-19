# OGStack — Product Requirements Document (PRD)

**Version:** 1.2
**Date:** March 19, 2026

---

## 1. Executive Summary

**OGStack** is a developer-first API platform that instantly generates beautiful, contextual Open Graph (OG) images for any URL — with zero design effort. Developers add a single line of code (or just a meta tag) to their site, and every page instantly gets a professional social preview image when shared on Twitter/X, LinkedIn, Slack, Discord, and other platforms.

The platform combines template-based rendering (Satori) with optional AI-generated contextual artwork (Flux Schnell / Flux Pro / Ideogram) to produce unique, branded social cards — eliminating the need for manual design work.

**Core Differentiator:** OGStack delivers the lowest-friction path from "no OG image" to "beautiful social cards" — a single API call, instant results. Template-only tools (Placid, Bannerbear, Vercel OG) require complex setup. Screenshot tools (ScreenshotOne) produce ugly captures. OGStack makes every link look great automatically, with optional AI-powered artwork for users who want unique, content-aware visuals.

---

## 1.1 Brand Identity

**Name:** OGStack
**Tagline:** _"Beautiful social previews. Zero effort."_
**Positioning:** Developer-first infrastructure for instant, automated Open Graph image generation — with optional AI-powered artwork.

| Touchpoint           | Value                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Primary domain       | `ogstack.dev`                                                                                                                      |
| API endpoint         | `api.ogstack.dev`                                                                                                                  |
| CDN domain           | `cdn.ogstack.dev`                                                                                                                  |
| Dashboard            | `ogstack.dev/dashboard`                                                                                                            |
| Documentation        | `ogstack.dev/docs`                                                                                                                 |
| Audit tool           | `ogstack.dev/audit`                                                                                                                |
| Admin panel          | `ogstack.dev/admin`                                                                                                                |
| npm packages         | `@ogstack/nextjs`, `@ogstack/astro`, `@ogstack/wordpress`                                                                          |
| GitHub Action        | `ogstack/generate-action@v1`                                                                                                       |
| CLI tool             | `npx ogstack generate --url <url>`                                                                                                 |
| Free tier watermark  | `⚡ ogstack.dev` (small, bottom-right corner)                                                                                      |
| Meta tag integration | `<meta property="og:image" content="https://api.ogstack.dev/v1/generate?url=https://myblog.com/post-title&style=gradient_dark" />` |

---

## 2. Problem Statement

### 2.1 The Pain

When developers and businesses share links on social media, messaging apps, or documentation platforms, the preview image (OG image) is either missing, broken, or a generic placeholder. This results in lower click-through rates, poor brand perception, and lost traffic.

**Current solutions fail because:**

- **Manual design** doesn't scale — creating a unique OG image for every blog post, docs page, or product page requires a designer.
- **Template-only tools** require complex setup — most need SDKs, build steps, or deployment on specific platforms.
- **Screenshot tools** capture raw page HTML — unformatted, ugly, and not optimized for social preview dimensions (1200×630).
- **No existing tool makes it effortless** — pass a URL, get a beautiful image, integrate in minutes with framework plugins.

### 2.2 Who Feels This Pain

| Persona                                                | Pain Level                                                   | Willingness to Pay  |
| ------------------------------------------------------ | ------------------------------------------------------------ | ------------------- |
| Developer bloggers (personal sites, dev.to, Hashnode)  | High — they know OG images matter but hate designing them    | Medium ($12/mo)     |
| SaaS marketing teams                                   | Very High — every shared link is a brand impression          | High ($29-79/mo)    |
| Documentation teams (Docusaurus, GitBook, ReadTheDocs) | High — hundreds of pages need unique previews                | High ($29-79/mo)    |
| Content agencies managing multiple client sites        | Very High — repetitive work across dozens of sites           | Very High ($79+/mo) |
| Open-source maintainers                                | Medium — want professional appearance but budget-constrained | Low (Free tier)     |

### 2.3 Market Size

- 600M+ websites exist globally; ~200M are actively maintained.
- Every website that shares links on social media needs OG images.
- The social media management tools market is valued at $25B+ (2026).
- Adjacent competitors (Placid, Bannerbear, Robolly) have raised $1-10M each, validating the market.
- Direct TAM for developer-focused OG image tooling: estimated $500M-$1B addressable.

---

## 3. Product Vision

> **"Every link shared on the internet should look beautiful — automatically."**

OGStack evolves from an OG image API into the **visual identity layer for the internet** — the platform that ensures every URL, when shared anywhere, presents a professional, branded, contextual visual preview without human effort.

### 3.1 Long-Term Vision (18 months)

- Phase 1 (Months 1-3): Core API + templates + optional AI backgrounds → **Launch and acquire first 1,000 users**
- Phase 2 (Months 4-6): OG Score audit tool + Brand Kit + framework plugins → **Viral growth engine**
- Phase 3 (Months 7-12): Community Templates + Smart Style Matching + analytics → **Platform and ecosystem**
- Phase 4 (Months 13-18): A/B testing + animated OGs + enterprise features → **Category leadership**

---

## 4. Tech Stack

| Layer                    | Technology                                           | Rationale                                                                                                            |
| ------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **API Server**           | ElysiaJS (on Bun)                                    | Sub-100ms response times for template rendering; Bun's speed advantage for URL scraping and image processing         |
| **Frontend / Dashboard** | Next.js 15 (App Router)                              | SSR for SEO on landing pages, marketing pages, and public gallery; React Server Components for dashboard performance |
| **Database / ORM**       | Prisma + PostgreSQL                                  | Relational model for users ↔ API keys ↔ templates ↔ usage ↔ cached images; type-safe queries                         |
| **AI Image Generation**  | Flux Schnell (via FAL.ai), Flux 2 Pro, Ideogram 3.0  | Contextual background artwork; tiered quality by plan                                                                |
| **AI Prompt Generation** | Claude Haiku / GPT-4o Mini                           | Converts page metadata into optimized image generation prompts                                                       |
| **Template Rendering**   | Satori + @resvg/resvg-js                             | JSX → SVG → PNG pipeline; edge-compatible, no browser dependency                                                     |
| **CDN / Image Storage**  | Cloudflare R2 + Cloudflare CDN                       | Global edge caching for generated images; R2 for persistent storage (S3-compatible, zero egress fees)                |
| **Authentication**       | API key-based (for API), NextAuth.js (for dashboard) | Simple API key auth for developers; OAuth for dashboard login                                                        |
| **Payments**             | Stripe                                               | Subscription billing, usage-based metering, checkout                                                                 |
| **Monitoring**           | Upstash (rate limiting), Axiom (logging)             | Redis-based rate limiting per API key; structured logging                                                            |

---

## 5. Core Features (MVP — Month 1)

### 5.1 OG Image Generation API

**Description:** A REST API endpoint that accepts a URL (or manual parameters) and returns a generated OG image as PNG.

**Two Modes:**

**Mode A — URL-based (automatic)**

```text
GET https://api.ogstack.dev/v1/generate?url=https://myblog.com/post-title&style=gradient_dark
```

The API scrapes the target URL, extracts meta tags (title, description, favicon, author), and generates an OG image automatically. Supports full customization via query parameters.

**Mode B — Parameter-based (manual)**

```text
POST https://api.ogstack.dev/v1/generate
{
  "title": "How to Build a SaaS in 2026",
  "description": "A complete guide for founders",
  "logo": "https://myblog.com/logo.png",
  "theme": "dark",
  "accent_color": "#FF6B35",
  "template": "split_hero",
  "ai_background": true
}
```

**API Response:** Returns the image as binary PNG (Content-Type: image/png) for direct use in `<meta>` tags, or returns a JSON response with the CDN URL.

**Technical Flow:**

1. Receive request → validate API key → check rate limits
2. Check CDN cache for existing image (cache key = hash of URL + parameters)
3. Cache HIT → redirect to CDN URL (< 50ms)
4. Cache MISS → scrape URL for meta tags (title, description, favicon, og:image fallback)
5. If `ai_background: true` and user tier allows → generate AI prompt from content → call Flux Schnell API → receive background image
6. Render Satori template with extracted content + AI background (or template pattern)
7. Convert SVG → PNG via resvg
8. Upload to Cloudflare R2 → cache on CDN
9. Return image

**Acceptance Criteria:**

- Template-only generation completes in < 500ms (p95)
- AI-enhanced generation completes in < 8 seconds (p95), cached in < 100ms
- Output dimensions: 1200×630px (standard OG size) with option for 1200×675 (Twitter) and 1080×1080 (Instagram)
- Supports JPEG and PNG output formats
- Handles URLs that require JavaScript rendering (SPA fallback via metadata extraction)

### 5.2 Template System

**Description:** A library of pre-designed, customizable OG image templates rendered via Satori.

**MVP Templates (10 minimum):**

| Template ID      | Name            | Description                                      |
| ---------------- | --------------- | ------------------------------------------------ |
| `gradient_dark`  | Dark Gradient   | Title on dark gradient with accent color border  |
| `gradient_light` | Light Gradient  | Title on light gradient, clean and minimal       |
| `split_hero`     | Split Hero      | Left text, right image/pattern area              |
| `centered_bold`  | Centered Bold   | Large centered title with subtle background      |
| `blog_card`      | Blog Card       | Author avatar, title, reading time, site name    |
| `docs_page`      | Documentation   | Sidebar-style layout with section breadcrumbs    |
| `product_launch` | Product Launch  | Hero-style with tagline and CTA                  |
| `changelog`      | Changelog       | Version badge, date, update title                |
| `github_repo`    | Repository Card | Stars, language, description (GitHub-style)      |
| `minimal`        | Minimal         | Just the title, nothing else, maximum whitespace |

**Each template supports:**

- Custom accent color (hex code)
- Custom font selection (from a curated list: Inter, Plus Jakarta Sans, Space Grotesk, JetBrains Mono, Noto Sans)
- Logo/favicon placement
- Dark/light mode toggle
- AI background toggle (Pro+ tiers)

### 5.3 Dashboard (Next.js)

**Description:** A web-based dashboard where users manage their account, API keys, templates, brand settings, and view analytics.

**Dashboard Pages:**

| Page                    | Description                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `/dashboard`            | Overview: usage stats, recent images, quick actions                                     |
| `/dashboard/api-keys`   | Create, revoke, and manage API keys                                                     |
| `/dashboard/templates`  | Browse, preview, and customize templates                                                |
| `/dashboard/images`     | Gallery of all generated images with search/filter                                      |
| `/dashboard/brand`      | Brand Kit: upload logo, set colors, choose fonts                                        |
| `/dashboard/settings`   | Account settings, billing, team management                                              |
| `/dashboard/playground` | Interactive playground: enter a URL, pick a template, preview the OG image in real-time |

**Playground Feature:** The playground is the primary onboarding tool. New users paste a URL, select a template, tweak colors, and see a live preview instantly. The "Deploy" button gives them the meta tag to add to their site.

### 5.3.1 Admin Panel

**Description:** A protected internal admin area for the OGStack team to manage users, monitor subscriptions, and handle basic support operations. Accessible only to users with the `ADMIN` role.

**Admin Pages:**

| Page                        | Description                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/admin`                    | Overview: total users, MRR, active subscriptions, images generated today, signups this week                     |
| `/admin/users`              | Paginated user list with search (by email, name, or ID) and filters (by plan, signup date, status)              |
| `/admin/users/[id]`         | User detail: profile info, current plan, usage stats, API keys, generated images, audit history                 |
| `/admin/subscriptions`      | All active Stripe subscriptions with plan breakdown, filterable by tier and status (active, past due, canceled) |
| `/admin/subscriptions/[id]` | Subscription detail: billing history, plan changes, next invoice date                                           |

**Admin Actions:**

| Action                   | Location         | Description                                                                                                                                                                                           |
| ------------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change user plan         | User detail page | Override a user's subscription tier directly (e.g., upgrade a user to Pro for a support case or partnership). Syncs with Stripe — updates both the database `plan` field and the Stripe subscription. |
| Grant bonus quota        | User detail page | Add extra image quota for the current billing period without changing the plan (e.g., for goodwill, beta testers, or promotional offers)                                                              |
| Suspend / unsuspend user | User detail page | Disable a user's account and revoke all API keys. Reversible.                                                                                                                                         |
| Reset API key            | User detail page | Force-revoke a specific API key (e.g., if compromised or abused)                                                                                                                                      |
| Impersonate user         | User detail page | View the dashboard as if logged in as the user, for debugging support issues. Read-only — no mutations allowed while impersonating.                                                                   |

**Access Control:**

- Admin routes protected by role-based middleware: only users with `role: ADMIN` can access `/admin/*`
- Admin role is assigned directly in the database (no self-service admin signup)
- All admin actions are logged to an audit trail (who did what, when, to which user)

**Technical Requirements:**

- Server-side rendered pages (Next.js App Router) — no client-side data fetching for sensitive user data
- Paginated queries with cursor-based pagination for the user list (expect 10K+ users by month 6)
- Stripe API integration for subscription mutations (use Stripe SDK, not direct database writes, for plan changes)
- Admin audit log stored in a separate `AdminAuditLog` table

### 5.4 User Authentication & API Key Management

**Authentication Methods:**

- **Dashboard:** GitHub OAuth, Google OAuth, email + password (via NextAuth.js)
- **API:** API key passed as `Authorization: Bearer <key>` header or `?api_key=<key>` query param

**API Key Features:**

- Users can create multiple API keys (e.g., one per project)
- Each key can be scoped to specific domains (e.g., only generate images for `myblog.com`)
- Keys can be revoked instantly
- Usage is tracked per key

### 5.5 Caching Strategy

**Multi-layer cache:**

| Layer                  | TTL        | Purpose                                                     |
| ---------------------- | ---------- | ----------------------------------------------------------- |
| Cloudflare CDN Edge    | 30 days    | Serve cached images globally with < 50ms latency            |
| Cloudflare R2 (origin) | Indefinite | Persistent storage of all generated images                  |
| In-memory (Bun)        | 5 minutes  | Hot cache for frequently requested images during generation |

**Cache Invalidation:**

- Users can manually purge a specific URL's cache via dashboard or API call
- Auto-refresh feature (Phase 2) re-scrapes URLs on a schedule and regenerates if content changed
- Cache key = SHA-256 hash of (URL + template + parameters + version)

### 5.6 Pricing & Billing

| Tier           | Price  | Image Quota        | AI Backgrounds      | Features                                                                                        |
| -------------- | ------ | ------------------ | ------------------- | ----------------------------------------------------------------------------------------------- |
| **Free**       | $0/mo  | 50 images/month    | No                  | 5 templates, "⚡ ogstack.dev" watermark, community support                                      |
| **Pro**        | $12/mo | 500 images/month   | Flux Schnell        | All templates, Brand Kit, custom fonts, no watermark, email support                             |
| **Business**   | $29/mo | 5,000 images/month | Flux Pro + Ideogram | Everything in Pro + Smart Style Matching, A/B testing, priority CDN, analytics, bulk generation |
| **Enterprise** | $79/mo | Unlimited          | All models          | Everything in Business + custom domain CNAME, SLA guarantee, dedicated support, SSO, team seats |

**Overage:** $0.02/image beyond quota (auto-billed or hard cap, user-configurable).

**Implementation:** Stripe Subscriptions with usage-based metering. Stripe webhooks handle plan changes, cancellations, and failed payments.

---

## 6. Feature: OG Score Audit Tool (Viral Growth Engine)

**Priority:** Phase 2 (Month 2-3)
**Goal:** Drive organic traffic, build brand awareness, and convert free users to paid.

### 6.1 Description

A free, publicly accessible tool at `ogstack.dev/audit` where anyone can enter a URL and receive a comprehensive social sharing audit report.

### 6.2 What It Analyzes

| Check                       | Weight | Details                                                                  |
| --------------------------- | ------ | ------------------------------------------------------------------------ |
| OG image exists             | 25%    | Does the page have `og:image` meta tag?                                  |
| Correct dimensions          | 15%    | Is the image 1200×630 (or close)?                                        |
| File size                   | 10%    | Is the image < 1MB for fast loading?                                     |
| Title & description present | 15%    | Are `og:title` and `og:description` set?                                 |
| Twitter Card tags           | 10%    | Are `twitter:card`, `twitter:image` set?                                 |
| Visual quality score        | 15%    | AI-based assessment: is the image visually appealing, readable, branded? |
| Platform preview accuracy   | 10%    | Does it render correctly across Twitter, LinkedIn, Slack, Discord?       |

### 6.3 Output

- **Score (0-100)** with letter grade (A+ to F)
- **Visual previews** showing how the URL currently appears on Twitter, LinkedIn, Slack, and Discord
- **Issue breakdown** with specific fix recommendations
- **One-click fix CTA:** "Fix all issues instantly with OGStack" → leads to signup

### 6.4 Viral Mechanics

- Shareable report cards: "My site scored 94/100 on OGStack!" with a branded image (meta-recursion: the audit report itself has a beautiful OG image)
- Embeddable badges: Sites can add a "Social Ready ✓" badge linking to their audit
- SEO play: Each audit generates a unique URL (e.g., `ogstack.dev/audit/myblog.com`) that gets indexed — targets long-tail searches like "myblog.com social preview"

### 6.5 Technical Requirements

- URL scraping: Fetch page HTML, extract all Open Graph and Twitter Card meta tags
- Image analysis: Download existing OG image, check dimensions, file size, format
- Platform simulation: Render preview mockups for Twitter, LinkedIn, Slack, Discord using platform-specific display rules
- AI quality assessment: Use a vision model to score visual quality (optional, Phase 3)
- Response time: Full audit completes in < 5 seconds
- Rate limiting: 10 audits per IP per hour (free), unlimited for authenticated users

---

## 7. Feature: Brand Kit & Smart Style Matching

**Priority:** Phase 2-3 (Month 3-6)
**Goal:** Increase stickiness and justify paid tiers for businesses.

### 7.1 Brand Kit (Manual Setup)

Users configure their brand identity in the dashboard:

| Setting              | Input                    | Usage                                       |
| -------------------- | ------------------------ | ------------------------------------------- |
| **Logo**             | Upload PNG/SVG (max 2MB) | Placed in OG image corner or header         |
| **Primary Color**    | Hex code or color picker | Accent color for templates, gradients       |
| **Secondary Color**  | Hex code or color picker | Supporting color for backgrounds, borders   |
| **Font**             | Select from curated list | Title and body text rendering               |
| **Default Template** | Select from library      | Applied when no template param is specified |
| **Domain(s)**        | List of domains          | Brand Kit auto-applies to matching domains  |

**Storage:** Brand Kit assets stored in Cloudflare R2. Configuration stored in Prisma/PostgreSQL.

### 7.2 Smart Style Matching (AI-Powered)

**Description:** Instead of manually configuring a Brand Kit, users click "Auto-detect" and the system:

1. Scrapes the user's website homepage
2. Takes a screenshot of the page
3. Uses a vision model (Claude or GPT-4o) to analyze the color palette, typography, and design style
4. Extracts dominant colors (primary, secondary, accent)
5. Identifies the closest matching font from the curated list
6. Detects the logo/favicon
7. Auto-populates the Brand Kit with detected values
8. Generates a sample OG image for preview and approval

**Technical Requirements:**

- Screenshot capture: Headless browser (Playwright) or screenshot API
- Vision model API call: Send screenshot to Claude/GPT-4o with prompt to extract design attributes
- Color extraction: Algorithmic extraction from screenshot pixels (k-means clustering) as fallback/supplement to AI
- Response time: < 15 seconds for full detection
- User confirmation required before saving (never auto-apply without review)

---

## 8. Feature: Community Templates

**Priority:** Phase 3 (Month 7-12)
**Goal:** Expand template variety without the overhead of building a full marketplace.

### 8.1 Description

A curated library of community-contributed OG image templates. Designers and developers submit templates via GitHub PR or a simple submission form. The OGStack team reviews, tests, and publishes accepted templates to the public library.

### 8.2 How It Works

**For Contributors:**

1. Fork the OGStack templates repository on GitHub (or use the submission form in the dashboard)
2. Write a Satori-compatible JSX template following the documented spec
3. Submit a PR with template code, preview screenshots, and metadata (name, category, description)
4. OGStack team reviews for quality, rendering correctness, and brand safety
5. Accepted templates are published to the public library with contributor attribution

**For Users:**

1. Browse the template library in the dashboard (filtered by category: tech, marketing, minimal, creative, business, documentation)
2. Preview any template with their own URL or custom content
3. All community templates are available to all users (free tier gets access to a rotating selection; paid tiers get full access)
4. Use via API like any built-in template

### 8.3 Contribution Guidelines

- Templates must render correctly at 1200×630, 1200×675, and 1080×1080
- Text must be readable at social media thumbnail sizes (~300×157px)
- Templates must support both dark and light modes
- No copyrighted imagery, logos, or fonts
- Contributors retain credit (name + link displayed on template card)
- OGStack reserves the right to modify templates for compatibility

### 8.4 Future Consideration: Paid Marketplace

If community template volume and user demand reach critical mass (50+ quality community templates, consistent user requests for premium designs), evaluate launching a paid marketplace with revenue sharing. This is **not on the current roadmap** — it would be a data-driven decision based on observed traction.

---

## 9. Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Users & Auth ───────────────────────────

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  avatarUrl       String?
  passwordHash    String?
  githubId        String?   @unique
  googleId        String?   @unique
  plan            Plan      @default(FREE)
  role            Role      @default(USER)
  stripeCustomerId String?  @unique
  stripeSubId     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  apiKeys         ApiKey[]
  brandKits       BrandKit[]
  generatedImages GeneratedImage[]
  auditReports    AuditReport[]
  usageRecords    UsageRecord[]
}

enum Plan {
  FREE
  PRO
  BUSINESS
  ENTERPRISE
}

enum Role {
  USER
  ADMIN
}

model ApiKey {
  id            String    @id @default(cuid())
  key           String    @unique @default(cuid())
  name          String
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  allowedDomains String[] @default([])
  isActive      Boolean   @default(true)
  lastUsedAt    DateTime?
  createdAt     DateTime  @default(now())

  generatedImages GeneratedImage[]
  usageRecords    UsageRecord[]

  @@index([key])
}

// ─── Brand Kit ──────────────────────────────

model BrandKit {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name            String   @default("Default")
  domains         String[] @default([])
  logoUrl         String?
  primaryColor    String   @default("#000000")
  secondaryColor  String   @default("#FFFFFF")
  accentColor     String   @default("#3B82F6")
  fontFamily      String   @default("inter")
  defaultTemplate String   @default("gradient_dark")
  isDefault       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, name])
}

// ─── Templates ──────────────────────────────

model Template {
  id          String         @id @default(cuid())
  slug        String         @unique
  name        String
  description String?
  category    TemplateCategory
  previewUrl  String?
  jsxCode     String         @db.Text
  isBuiltIn   Boolean        @default(false)
  isCommunity Boolean        @default(false)
  contributorName String?
  contributorUrl  String?
  darkMode    Boolean        @default(true)
  lightMode   Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  generatedImages GeneratedImage[]
}

enum TemplateCategory {
  TECH
  MARKETING
  MINIMAL
  CREATIVE
  BUSINESS
  DOCUMENTATION
  SOCIAL
}

// ─── Generated Images ───────────────────────

model GeneratedImage {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  apiKeyId      String?
  apiKey        ApiKey?   @relation(fields: [apiKeyId], references: [id])
  templateId    String?
  template      Template? @relation(fields: [templateId], references: [id])

  sourceUrl     String?
  cacheKey      String    @unique
  imageUrl      String
  cdnUrl        String?

  title         String?
  description   String?
  faviconUrl    String?

  width         Int       @default(1200)
  height        Int       @default(630)
  format        ImageFormat @default(PNG)
  fileSize      Int?

  aiModel       String?
  aiPrompt      String?   @db.Text
  aiEnabled     Boolean   @default(false)

  generationMs  Int?
  serveCount    Int       @default(0)

  createdAt     DateTime  @default(now())
  expiresAt     DateTime?

  @@index([cacheKey])
  @@index([userId, createdAt])
  @@index([sourceUrl])
}

enum ImageFormat {
  PNG
  JPEG
  WEBP
}

// ─── OG Score Audit ─────────────────────────

model AuditReport {
  id            String   @id @default(cuid())
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  url           String
  overallScore  Int
  letterGrade   String
  hasOgImage    Boolean
  ogImageUrl    String?
  ogImageWidth  Int?
  ogImageHeight Int?
  ogImageSize   Int?
  hasOgTitle    Boolean
  hasOgDesc     Boolean
  hasTwitterCard Boolean
  issues        Json
  previews      Json
  createdAt     DateTime @default(now())

  @@index([url])
}

// ─── Usage Tracking ─────────────────────────

model UsageRecord {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  apiKeyId    String?
  apiKey      ApiKey?  @relation(fields: [apiKeyId], references: [id])
  period      String
  imageCount  Int      @default(0)
  aiImageCount Int     @default(0)
  cacheHits   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, apiKeyId, period])
  @@index([userId, period])
}

// ─── Admin Audit Log ────────────────────────

model AdminAuditLog {
  id          String   @id @default(cuid())
  adminId     String
  adminEmail  String
  action      String
  targetUserId String?
  details     Json?
  createdAt   DateTime @default(now())

  @@index([adminId])
  @@index([targetUserId])
  @@index([createdAt])
}
```

---

## 10. API Reference (V1)

### 10.1 Authentication

All API requests require an API key:

```text
Authorization: Bearer og_live_abc123xyz
```

### 10.2 Endpoints

#### Generate OG Image (GET — URL Mode)

```text
GET /v1/generate?url={url}&template={template}&theme={theme}&ai={boolean}
```

| Parameter  | Type              | Required | Default         | Description                     |
| ---------- | ----------------- | -------- | --------------- | ------------------------------- |
| `url`      | string            | Yes\*    | —               | URL to generate OG image for    |
| `template` | string            | No       | User's default  | Template slug                   |
| `theme`    | `dark` \| `light` | No       | `dark`          | Color theme                     |
| `ai`       | boolean           | No       | `false`         | Enable AI background            |
| `accent`   | string            | No       | Brand Kit color | Hex color code                  |
| `font`     | string            | No       | Brand Kit font  | Font family name                |
| `format`   | `png` \| `jpeg`   | No       | `png`           | Output format                   |
| `width`    | number            | No       | `1200`          | Image width                     |
| `height`   | number            | No       | `630`           | Image height                    |
| `cache`    | boolean           | No       | `true`          | Use cached version if available |

**Response:** `200 OK` with `Content-Type: image/png` (binary image data)

#### Generate OG Image (POST — Manual Mode)

```text
POST /v1/generate
Content-Type: application/json

{
  "title": "How to Build a SaaS",
  "description": "A complete guide for founders",
  "logo": "https://example.com/logo.png",
  "author": "Jane Doe",
  "template": "blog_card",
  "theme": "dark",
  "accent_color": "#FF6B35",
  "ai_background": true,
  "format": "png"
}
```

**Response:**

```json
{
  "success": true,
  "image_url": "https://cdn.ogstack.dev/images/abc123.png",
  "cache_key": "abc123",
  "generation_ms": 3200,
  "ai_model": "flux-schnell",
  "cached": false
}
```

#### Purge Cache

```text
DELETE /v1/cache?url={url}
```

**Response:**

```json
{
  "success": true,
  "purged": 1,
  "message": "Cache purged for URL"
}
```

#### Get Usage Stats

```text
GET /v1/usage?period=2026-03
```

**Response:**

```json
{
  "period": "2026-03",
  "images_generated": 342,
  "ai_images_generated": 89,
  "cache_hits": 12847,
  "quota_limit": 500,
  "quota_remaining": 158
}
```

#### Run OG Audit

```text
POST /v1/audit
Content-Type: application/json

{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "url": "https://example.com",
  "score": 67,
  "grade": "C+",
  "checks": {
    "og_image_exists": { "pass": true, "details": "Found og:image tag" },
    "og_image_dimensions": {
      "pass": false,
      "details": "Image is 800×400, recommended 1200×630"
    },
    "og_title": { "pass": true, "details": "Title found: 'Example Site'" },
    "og_description": {
      "pass": false,
      "details": "No og:description tag found"
    },
    "twitter_card": { "pass": false, "details": "No twitter:card tag found" },
    "file_size": { "pass": true, "details": "Image is 145KB (under 1MB limit)" }
  },
  "previews": {
    "twitter": "https://cdn.ogstack.dev/previews/abc_twitter.png",
    "linkedin": "https://cdn.ogstack.dev/previews/abc_linkedin.png",
    "slack": "https://cdn.ogstack.dev/previews/abc_slack.png",
    "discord": "https://cdn.ogstack.dev/previews/abc_discord.png"
  },
  "fix_url": "https://ogstack.dev/fix?url=https://example.com"
}
```

### 10.3 Rate Limits

| Tier       | Requests/minute | Requests/day |
| ---------- | --------------- | ------------ |
| Free       | 10              | 100          |
| Pro        | 60              | 2,000        |
| Business   | 120             | 10,000       |
| Enterprise | 300             | Unlimited    |

Rate limit headers included in every response:

```text
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 54
X-RateLimit-Reset: 1711036800
```

### 10.4 Error Codes

| Code                  | Status | Description                                     |
| --------------------- | ------ | ----------------------------------------------- |
| `invalid_api_key`     | 401    | API key is missing, invalid, or revoked         |
| `rate_limit_exceeded` | 429    | Too many requests                               |
| `quota_exceeded`      | 402    | Monthly image quota exceeded                    |
| `invalid_url`         | 400    | URL is malformed or unreachable                 |
| `scrape_failed`       | 422    | Could not extract metadata from URL             |
| `template_not_found`  | 404    | Template slug does not exist                    |
| `generation_failed`   | 500    | Image generation failed (AI or rendering error) |
| `domain_not_allowed`  | 403    | URL domain not in API key's allowed domains     |

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Metric                         | Target      | Measurement                       |
| ------------------------------ | ----------- | --------------------------------- |
| Template-only generation (p95) | < 500ms     | Time from request to PNG response |
| AI-enhanced generation (p95)   | < 8 seconds | Time from request to PNG response |
| Cached image serving (p95)     | < 100ms     | CDN edge response time            |
| Dashboard page load (p95)      | < 2 seconds | Time to interactive               |
| API uptime                     | 99.9%       | Monthly availability              |

### 11.2 Security

- All API communication over HTTPS (TLS 1.3)
- API keys hashed in database (bcrypt); only shown once on creation
- URL scraping: sanitize and validate all input URLs; block private IP ranges (SSRF protection)
- Image generation: content moderation on AI outputs (reject NSFW/harmful content)
- Rate limiting per API key and per IP
- CORS configuration: API allows requests from any origin (public API)
- Dashboard: CSRF protection, secure session cookies, OAuth state validation
- Admin panel: role-based access control (ADMIN role only); all admin actions logged to audit trail; impersonation mode is read-only

### 11.3 Scalability

- Stateless API design: horizontal scaling via container orchestration
- CDN handles 99%+ of image serving traffic
- Database: connection pooling via PgBouncer; read replicas for analytics queries
- AI generation: fan-out to multiple providers (FAL.ai primary, Replicate fallback)
- Target: handle 10,000 concurrent image generation requests at scale

---

## 12. Launch Plan

### 12.1 Pre-Launch (Week 1-3)

- Build core API (ElysiaJS + Satori + Prisma)
- Build 10 default templates
- Integrate Flux Schnell via FAL.ai
- Build dashboard MVP (auth, API keys, playground, basic usage stats)
- Build admin panel MVP (user list, subscription management, plan overrides)
- Set up Stripe billing
- Build landing page with interactive demo
- Write documentation

### 12.2 Launch (Week 4)

**Primary Channels:**

- Product Hunt launch (schedule for Tuesday, prepare assets)
- Hacker News "Show HN" post
- Twitter/X thread: "I built a tool that gives any URL beautiful social previews with one meta tag — here's how it works"
- Reddit: r/webdev, r/SideProject, r/nextjs, r/programming
- Dev.to and Hashnode articles

**Launch Offer:** First 500 signups get Pro tier free for 3 months.

### 12.3 Post-Launch Growth (Month 2-6)

- Ship OG Score audit tool → viral loop
- Ship framework plugins (Next.js, Astro, WordPress) → distribution channels
- Content marketing: "The Ultimate Guide to Open Graph Images" (SEO target)
- Ship Chrome Extension → daily active engagement
- Launch community template contributions (GitHub repo + submission form) → expand template library with zero internal design cost
- Partnerships: approach Vercel, Netlify, Hashnode for integrations

---

## 13. Success Metrics

### 13.1 North Star Metric

**Monthly Active OG Images Served** — the total number of OG images served from the CDN per month. This metric captures both user acquisition (more sites using the API) and engagement (more social sharing generating image requests).

### 13.2 Key Performance Indicators

| KPI                             | Month 1 Target | Month 3 Target | Month 6 Target |
| ------------------------------- | -------------- | -------------- | -------------- |
| Registered users                | 500            | 3,000          | 15,000         |
| Paying users                    | 20             | 150            | 800            |
| MRR (Monthly Recurring Revenue) | $300           | $2,500         | $15,000        |
| OG images generated (unique)    | 5,000          | 50,000         | 500,000        |
| OG images served (CDN)          | 50,000         | 1,000,000      | 20,000,000     |
| OG Score audits run             | 1,000          | 10,000         | 50,000         |
| Free → Paid conversion rate     | 4%             | 5%             | 6%             |
| Churn rate (monthly)            | —              | < 8%           | < 5%           |

### 13.3 Unit Economics Target

| Metric                          | Target                                         |
| ------------------------------- | ---------------------------------------------- |
| Customer Acquisition Cost (CAC) | < $10 (organic-led)                            |
| Average Revenue Per User (ARPU) | $18/month                                      |
| Lifetime Value (LTV)            | $180 (10-month avg retention)                  |
| LTV:CAC ratio                   | > 15:1                                         |
| Gross margin                    | > 85% (low infrastructure cost due to caching) |
| AI cost per image               | < $0.01 (blended across tiers)                 |

---

## 14. Risks & Mitigations

| Risk                                          | Likelihood | Impact | Mitigation                                                                                                         |
| --------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| AI model provider (FAL.ai) has outage         | Medium     | High   | Implement fallback to Replicate; template-only mode as degraded experience                                         |
| Competitor (Vercel) builds native OG image AI | Medium     | High   | Move faster; focus on features Vercel won't build (marketplace, audit tool, multi-framework)                       |
| URL scraping blocked by target sites          | Low        | Medium | Respect robots.txt; fallback to manual parameter mode; use metadata extraction libraries (not full rendering)      |
| AI generates inappropriate content            | Low        | High   | Content moderation layer; restrict prompts to abstract/geometric styles; human review for flagged outputs          |
| Low conversion from free to paid              | Medium     | High   | Improve watermark visibility; gate AI features strictly; build features that create lock-in (Brand Kit, analytics) |
| Scaling costs exceed revenue                  | Low        | Medium | Aggressive caching (99%+ cache hit rate); usage-based pricing prevents abuse; auto-scaling with spending caps      |

---

## 15. Open Questions

| #   | Question                                                                         | Owner       | Status                                              |
| --- | -------------------------------------------------------------------------------- | ----------- | --------------------------------------------------- |
| 1   | Should we support custom font uploads (WOFF2) on Pro+ or only curated fonts?     | Engineering | Open                                                |
| 2   | Should the audit tool require signup or be completely anonymous?                 | Product     | Leaning anonymous (lower friction)                  |
| 3   | What is the submission and review process for community templates?               | Design      | Open                                                |
| 4   | Should we offer a Figma plugin for designing templates visually?                 | Product     | Deferred to Phase 4                                 |
| 5   | How do we handle OG images for SPAs (React/Vue apps) with client-side rendering? | Engineering | Solution: fallback to `<title>` tag + manual params |
| 6   | Should we offer a dedicated on-premise / self-hosted version for Enterprise?     | Business    | Deferred to Phase 4                                 |

---

## 16. Appendix

### A. Competitor Analysis

| Competitor                 | What They Do                                | Pricing          | Weakness                                             |
| -------------------------- | ------------------------------------------- | ---------------- | ---------------------------------------------------- |
| **Vercel OG (@vercel/og)** | Open-source Satori wrapper for Next.js      | Free             | Code-only; no AI; no dashboard; only works on Vercel |
| **Placid.app**             | Template-based image generation API         | From $29/mo      | No AI; limited templates; expensive for the features |
| **Bannerbear**             | REST API for dynamic image/video generation | From $49/mo      | Generic (not OG-focused); no AI; expensive           |
| **ScreenshotOne**          | Screenshot API repurposed for OG images     | From $9/mo       | Screenshots, not designed images; ugly results       |
| **ogimageapi.io**          | Simple OG image API                         | Free tier + paid | Very basic; limited templates; no AI; no brand kit   |
| **Robolly**                | Cloud image generation API                  | From $19/mo      | Not OG-focused; template-heavy; no AI                |

**OGStack's unique advantages:**

1. Lowest-friction integration: a single API call to generate images — framework plugins for Next.js, Astro, and WordPress make it even easier
2. Only product with OG Score audit tool (viral growth engine)
3. Optional AI-generated contextual artwork as a premium upsell (no competitor offers this)
4. Only product with Smart Style Matching (AI analyzes your site's design)
5. Framework-agnostic: works with any stack, any hosting provider — plugins for Next.js, Astro, WordPress as convenience, not requirement

### B. User Journey: Developer Blogger

1. **Discovery:** Sees a tweet: "Just got a 94/100 OG Score on ogstack.dev/audit — my social cards look incredible now"
2. **Audit:** Visits `ogstack.dev/audit`, enters their blog URL, sees a score of 32/100 with ugly previews
3. **Playground:** Clicks "Fix it" → enters the playground, pastes their blog URL, picks a dark gradient template, sees a beautiful preview instantly
4. **Signup:** Creates a free account (GitHub OAuth), gets their API key
5. **Integration:** Adds a few lines to their site's server/build step to call the API and set the `og:image` meta tag — takes minutes with framework plugins (Next.js, Astro)
6. **Wow moment:** Shares a blog post on Twitter, sees the beautiful OG image in the preview
7. **Upgrade trigger:** Hits 50 image limit, or wants AI backgrounds / no watermark → upgrades to Pro ($12/mo)
8. **Retention:** Sets up Brand Kit, adds all their projects → switching cost increases
9. **Advocacy:** Shares their OG Score badge, tells friends, refers colleagues

### C. Reference: OG Image Specifications by Platform

| Platform  | Recommended Size | Aspect Ratio | Max File Size | Format         |
| --------- | ---------------- | ------------ | ------------- | -------------- |
| Twitter/X | 1200×628         | 1.91:1       | 5MB           | PNG, JPEG, GIF |
| LinkedIn  | 1200×627         | 1.91:1       | 5MB           | PNG, JPEG      |
| Facebook  | 1200×630         | 1.91:1       | 8MB           | PNG, JPEG      |
| Slack     | 1200×630         | ~1.91:1      | —             | PNG, JPEG      |
| Discord   | 1200×630         | ~1.91:1      | 8MB           | PNG, JPEG, GIF |
| iMessage  | 1200×630         | ~1.91:1      | —             | PNG, JPEG      |
| WhatsApp  | 1200×630         | ~1.91:1      | —             | PNG, JPEG      |

**Default output:** 1200×630 PNG (universally compatible).
