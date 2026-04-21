# Deployment

## Production

OGStack is **self-hosted on a VPS**. The public site runs at [ogstack.dev](https://ogstack.dev), with the API behind `api.ogstack.dev` and docs at `docs.ogstack.dev`. Generated images are served from `cdn.ogstack.dev` (Cloudflare CDN in front of Cloudflare R2).

## Pipeline

Two GitHub Actions workflows:

- **[ci.yml](../.github/workflows/ci.yml)** runs on every push and PR: format check, Prisma generate, typecheck (all 4 workspaces), API tests, web plus docs build, secret scan (gitleaks), dependency audit (`bun audit`).
- **[deploy.yml](../.github/workflows/deploy.yml)** runs on push to `prod`: builds Docker images for `api`, `web`, `docs`, pushes them to GitHub Container Registry, SSHs into the VPS, and runs `docker compose pull && docker compose up -d --force-recreate`. A post-deploy `/health` check confirms the API is responsive.

## Why VPS over Vercel

- The API is a long-running process with Postgres connections, background jobs (demo project cleanup, Stripe webhook sync), and local image-generation binaries (resvg, Satori). Not a fit for serverless cold-start plus 10-second execution limits.
- Generated images are persisted to Cloudflare R2 (via direct S3-compatible calls from the API), then served from a CDN. Vercel's edge caching doesn't add value here.
- OAuth callback URLs and Stripe webhook endpoints need stable, predictable hostnames. VPS plus Caddy gives a single public surface without per-environment URL churn.

## Required secrets

Set in GitHub, Settings, Secrets and variables, Actions:

- `SSH_HOST`, `SSH_USER`, `SSH_KEY`. Target VPS.
- `ENV_DOCKER`. The full `.env` contents the deploy step copies onto the host.
- `GCP_SA_KEY`. reCAPTCHA Enterprise service account JSON.

Set as repository **variables** (visible to the build step):

- `NEXT_PUBLIC_*`. Web app environment values baked into the Next.js build.

## Required services

- **VPS** with Docker plus docker-compose, reachable over SSH on port 22, with Caddy terminating TLS on 80/443.
- **Postgres**. The docker-compose brings up a local Postgres by default. Swap the `DATABASE_URL` env var for a managed provider if desired.
- **Cloudflare R2** bucket for generated images.
- **Stripe** account (test-mode key works for non-production environments).
- **FAL.ai** account for Flux AI image generation.
- **Anthropic Claude API** key for the AI prompt builder used by the generation service.
- **GitHub plus Google OAuth apps** registered with the correct callback URLs.

See [.env.example](../.env.example) for the full list of variables.

## Local development

See [development.md](development.md) for running the apps locally. Production and local are intentionally similar. The same Dockerfile per app is used in both.
