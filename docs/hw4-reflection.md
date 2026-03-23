# HW4 Reflection: Claude Code Workflow & TDD

## The Explore → Plan → Implement → Commit Workflow

Before this assignment, my approach to writing code was straightforward: read the
task, open a file, and start typing. If something broke I'd fix it. If I needed
to understand existing code I'd skim it while writing. There was no real separation
between understanding, designing, and building — it all happened simultaneously,
which meant I often wrote code that didn't fit the existing architecture or had to
be thrown away.

The Explore → Plan → Implement → Commit workflow forced a hard separation between
those phases, and the difference was immediately noticeable. During the Explore
phase, Claude Code used Glob and Read to map out packages/shared/src before a
single line was written. I could see what types already existed, what was already
exported from index.ts, and what conventions the codebase was following. This took
maybe two minutes but completely changed what got built — the implementation fit
cleanly into the existing structure instead of fighting it.

The Plan phase was the most uncomfortable for me. I'm used to planning being
something that happens in my head while I'm already typing. Being forced to write
out the approach first — what the function needs to reject, what edge cases exist,
what the function signature looks like — felt slow. But when implementation started,
there were zero "wait, I didn't think about that" moments. The plan had already
caught them.

## Context Management

The biggest insight from this assignment was that CLAUDE.md is not documentation —
it's a system prompt for your coding agent. Every session Claude Code reads it
fresh, so anything not in that file has to be re-explained from scratch. I ran
/init early to see what Claude Code inferred about the project on its own, then
used that output to identify gaps in the CLAUDE.md — things I assumed were obvious
but weren't captured anywhere. The @import docs/prd.md reference was particularly
useful because it meant Claude Code could answer product questions without me
pasting context manually.

For a project this size, I'd add one thing going forward: a /compact call at the
start of long implementation sessions to summarize earlier context before it gets
pushed out of the context window.

## TDD Through Claude Code

Writing 49 failing tests before any implementation existed was genuinely
uncomfortable. The instinct is to write some code first so the tests have something
to test against. But the red phase produced something unexpected: a much more
thorough test suite than I would have written after the fact.

When I wrote tests first, I had to think about every way validateUrl() could be
called — not just the happy path. That's how the test suite ended up covering
encoding bypasses (hex, decimal, octal, URL-encoded), IPv6 loopback variants, and
IPv4-mapped IPv6 addresses. Those edge cases would never have made it into
after-the-fact tests because the implementation would have already anchored my
thinking. The SSRF protection that resulted is genuinely production-quality because
the tests demanded it.

The refactor phase also felt different with a full test suite behind it. Renaming
isPrivateIPv4 to isPrivateIp and extracting it as a named export took 40 seconds
and I had immediate confidence it didn't break anything — 47/47 green.

## Annotated Session Log

[See screenshots captured during session showing /init output, Explore phase
(Glob + Read on packages/shared/src), Plan mode output for validateUrl design,
red phase test run (49 failing), green phase test run (47 passing), and final
refactor commit.]

**Commit history showing TDD cycle:**
- `a0d2aca` — test: add failing tests for validateUrl SSRF protection (red)
- `1920174` — feat: implement validateUrl SSRF protection (green)
- `2940920` — refactor: extract isPrivateIp helper and export validateUrl
