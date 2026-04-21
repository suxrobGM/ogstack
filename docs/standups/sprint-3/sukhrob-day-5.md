# Async Standup - Sukhrob

**Sprint:** 3
**Date:** 2026-04-11 (day 5)
**Channel:** Shared doc

## Yesterday plus day before

- #35 (Stripe billing) merged. Checkout plus portal plus webhook state sync all working in test mode. A paid Pro-tier subscription flips the user's `plan` field and resyncs quotas correctly.
- #42 (tiered rate limiting) merged. Per-minute plus per-hour plus monthly caps per tier. Crawler bypass for Googlebot, Slackbot, Facebook. This one was caught in review. Important for OG meta tag fetches.
- #37 (FAL.ai Flux integration) started. Prompt builder design in `modules/generation/prompt-providers/`. Chain-of-fallback: user override, then Claude prompt provider, then rule-based.

## Today

- Finish #37. Then #38 (5 more templates). Data not code.
- Start #45 (CI pipeline). Want the pipeline green before Monday.
- Deploy pipeline (deploy.yml) plus Dockerfile per app. Multi-stage Bun images to keep sizes down.

## Blockers

- `eslint-plugin-react` doesn't yet support ESLint 10. Considering pinning to ESLint 9 or disabling the web lint step. Leaning toward disable plus a TODO commit so CI isn't blocked.

## Notes for Raja

- Stripe test cards for your dev loop: `4242 4242 4242 4242` works, `4000 0000 0000 9995` triggers insufficient funds for error-path testing.
