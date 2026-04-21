# Async Standup - Raja

**Sprint:** 3
**Date:** 2026-04-07 (day 1)
**Channel:** Shared doc

## Yesterday

- Sprint 2 retrospective plus Sprint 3 planning. My plate: OAuth buttons plus callback pages, billing UI, password reset pages, images gallery, landing page.
- Did a quick audit of the existing web pages. `/add-page` v2 is at a good place. V3 tweaks are for edge cases that don't block Sprint 3.

## Today

- Start #44 (landing page). This is the biggest single item and the highest-visibility. It's the thing people first see. Planning a hero section with an embedded interactive audit tool so visitors can try it without signing up.
- Lay out sections: hero, how-it-works, feature showcase, template gallery, pricing teaser, FAQ, footer.

## Blockers

None.

## Notes for Sukhrob

- Your OAuth callback URL plan looks right to me. One ask: please don't forget to set `API_PUBLIC_URL` in the `.env.example`. OAuth providers need a real URL during registration, and I don't want to guess which one you registered.
