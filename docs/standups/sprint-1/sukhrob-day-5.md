# Async Standup - Sukhrob

**Sprint:** 1
**Date:** 2026-03-28 (day 5)
**Channel:** Shared doc

## Yesterday plus day before

- #6 merged. URL metadata extractor plus SSRF guard in one PR. The guard blocks RFC1918 (10/8, 172.16/12, 192.168/16), loopback (127/8, ::1), link-local (169.254/16, fe80::/10), and non-http(s) schemes. DNS resolution happens before the fetch and the resolved IP is re-checked.
- #7 (Satori plus resvg pipeline) is painful. Satori doesn't support flex-wrap or calc(). Had to rewrite two templates. Shipped `template.registry.test.ts` for behavior coverage.
- `build:types` target added to `apps/api`. Eden Treaty client types now export cleanly. Raja is unblocked on the typed API client.

## Today

- #8 (five built-in templates). Gradient dark, gradient light, split, minimal, bold-headline. Reusing the rendering pipeline from #7 so this should be mostly data not code.
- Start #9 (generation service) on the side.
- Write Satori rendering regression tests. Checked-in reference PNGs that the test compares byte-for-byte.

## Blockers

- Satori's font loading is opaque. If I don't find a way to preload fonts into the renderer, every generation call is going to pay a fetch cost. Will timebox 1h today. If no progress, add a GitHub issue and move on.

## Notes for Raja

- `build:types` is now part of `cd apps/api && bun run dev`. Your local dev should have live type updates as I change routes.
