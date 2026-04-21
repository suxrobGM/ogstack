# Async Standup - Sukhrob

**Sprint:** 3
**Date:** 2026-04-07 (day 1)
**Channel:** Shared doc

## Yesterday

- Sprint 2 retrospective plus Sprint 3 planning. Sprint 3 is "make it launchable." OAuth, billing, AI, rate limiting, CI, deploy. My plate: 8 backend issues.
- Pre-work: signed up for Stripe test mode and FAL.ai sandbox accounts. Got API keys into `.env.example` as placeholders.

## Today

- Start #32 (GitHub OAuth) and #33 (Google OAuth) together. They share about 70% of the code path. Going to factor an `OAuthService` that both providers plug into.
- Context7 pull on OAuth 2.0 PKCE flow plus the current `openid-client` v6 API.

## Blockers

None.

## Notes for Raja

- OAuth callback URL needs to be decided today. Proposal: `/api/auth/oauth/:provider/callback` (server-side handling), the web app's callback route is a thin wrapper that just redirects. Please confirm this matches your plan for #34.
