# Async Standup - Raja

**Sprint:** 3
**Date:** 2026-04-09 (day 3)
**Channel:** Shared doc

## Yesterday plus day before

- #44 (landing page) about 70% done. Hero plus feature showcase plus template gallery plus pricing teaser rendered. Interactive audit embed left. Mock data wired first.
- #34 (OAuth buttons plus callback pages) merged. Caught a `redundant api prefix` bug in the callback URL against Sukhrob's backend. Fixed in a one-line PR before it bit anyone in prod.
- Played with Playwright MCP extensively on the OAuth buttons flow. Being able to test GitHub plus Google consent loops via the conversation cut about 20 min off that verification.

## Today

- Wire the live audit tool into the landing page hero. Share component between `ogstack.dev/audit` and the embedded demo.
- Start #36 (billing UI). Pricing page renders the tier matrix. The "Upgrade" button redirects to Sukhrob's `/api/billing/session`.
- If time: #40 (password reset pages). Small task.

## Blockers

None.

## Notes for Sukhrob

- The billing page needs a way to show "current plan" plus "next renewal date" plus "cancel subscription" actions. What's the shape of `GET /api/billing/me`? Will I be proxying everything through Stripe portal or do we have our own status endpoint?
