# Async Standup - Raja

**Sprint:** 1
**Date:** 2026-03-28 (day 5)
**Channel:** Shared doc

## Yesterday plus day before

- `build:types` landed. Wired the Eden Treaty client (#15). The typed experience is great. The whole `/api/*` surface shows up with autocomplete.
- Confirmed the refresh token is in an httpOnly cookie (good), access token in the body (fine). AuthProvider stores access token in memory plus rehydrates on refresh via the cookie.
- #14 merged this morning. Auth flow works end-to-end against the API.

## Today

- Finish #15: add the React Query integration plus the `useApiQuery` / `useApiMutation` hooks so Sprint 2 pages have a consistent data-fetching pattern.
- Start drafting the `/add-page` skill. I want it ready by Sprint 2 day 1. Expect v1 to be wrong.

## Blockers

- Nothing blocking. Shell is in better shape than I expected for end-of-sprint.

## Notes for Sukhrob

- When you add new routes, please run `bun run build:types` so my TypeScript picks up the types. Small thing but it avoids "why doesn't my autocomplete work?" pings.
