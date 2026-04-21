# Async Standup - Sukhrob

**Sprint:** 3
**Date:** 2026-04-09 (day 3)
**Channel:** Shared doc

## Yesterday plus day before

- #32, #33 merged. GitHub plus Google OAuth work end-to-end. Playwright MCP confirmed both callback flows (click button, consent, callback, session established).
- Small fix-up commit needed later on OAuth callback URLs. They had a redundant `/api` prefix that didn't match what the providers registered. Caught by Raja on the web side. Fixed in one PR.
- #35 (Stripe) started. Pricing tiers defined in a single config source (`src/constants/plans.ts`) so the API, the web UI, and the DB seed all read from the same list.

## Today

- Push Stripe checkout plus portal redirect. Webhook handler for subscription state changes (`invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`).
- Start #42 (rate limiting). The tiered limits schema fits cleanly behind the same middleware as the existing per-endpoint limit. Just reads plan context now.

## Blockers

- Stripe webhooks need a public URL in dev. Using `stripe listen` CLI for local forwarding, works fine.

## Notes for Raja

- `/api/billing/session` returns a Stripe checkout URL. Your billing page can just redirect to that. No need to render Stripe's card form directly.
