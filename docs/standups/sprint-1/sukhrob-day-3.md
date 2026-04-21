# Async Standup - Sukhrob

**Sprint:** 1
**Date:** 2026-03-26 (day 3)
**Channel:** Shared doc

## Yesterday plus day before

- #3 merged. Migration applied cleanly. 13 models, all UUID PKs, soft-delete on User.
- #4 (project module) shipped. Used `/add-module project --crud --test` v1. Worked, but skill was weak: no pagination in the list endpoint, test file was TODO-only, the generated service didn't match the `@singleton()` plus PrismaClient-inject pattern.
- Started iterating the skill. V1 to v1.1 now reads an existing module before generating and matches its style.
- #5 (API key module) is about 60% done. HMAC-SHA-256 for the hashing path confirmed via Context7. Going with `crypto.timingSafeEqual` for comparison. `bcrypt` is too slow on the hot path.

## Today

- Finish #5. Write the test file by hand for now. The skill's test scaffold is still weak.
- Start #6 (URL metadata extraction). Plan: ship it in the same PR as the SSRF guard. No "we'll add the guard later." It has to ship in the same commit.

## Blockers

None.

## Notes for Raja

- Auth routes (`/auth/register`, `/auth/login`, `/auth/refresh`) are stable. You can point the auth provider (#15) at them now. Contract: `{ accessToken, refreshToken, user: {...} }` on success, error classes from `common/errors/` on failure.
