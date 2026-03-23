# HW4 Reflection — Claude Code Workflow & TDD

## How does the Explore→Plan→Implement→Commit workflow compare to your previous approach?

Before using Claude Code's structured workflow, my development process was more ad-hoc. I would typically jump into coding after a quick mental plan, often discovering issues mid-implementation that forced me to backtrack. The Explore→Plan→Implement→Commit pattern changed this in three meaningful ways.

**Explore phase eliminated assumptions.** When I started this assignment, the repository had placeholder files copied from a previous project (DepVault). Rather than assuming the codebase was clean, the Explore phase — using Glob, Grep, and Read tools — systematically uncovered stale references everywhere: the CLAUDE.md described the wrong product, the Prisma schema had models for Students and Employers, the Swagger plugin said "Connect API," and `.claude/rules/` referenced `@depvault/shared`. Without structured exploration, I might have built on top of broken foundations and spent hours debugging import errors later.

**Plan mode forced scope discipline.** Entering Plan mode before writing any code was surprisingly effective. I had to make explicit decisions: which feature to implement (auth + user vs. metadata scraper), how to handle the stale PRD (condensed summary vs. full import), and what the TDD commit sequence would look like. The Plan agent helped me think through the mocking strategy for tests before writing a single line. In my previous approach, these decisions would have been made implicitly during coding, often leading to inconsistencies or over-engineering.

**Commit-driven development created accountability.** Planning the commit sequence in advance — knowing that commit 3 would be "red" tests and commit 4 would be "green" implementation — gave each coding session a clear deliverable. Instead of working on "the auth feature" as an amorphous blob, I was working toward a specific, committable state. This made the work feel more structured and progress more measurable.

The main trade-off is speed on small tasks. For a quick bug fix, the full four-phase workflow adds overhead. But for any feature that touches multiple files or requires architectural decisions, the upfront investment in exploration and planning pays for itself many times over.

## What context management strategies worked best?

Context window management turned out to be one of the most impactful aspects of using Claude Code effectively. Three strategies stood out:

**1. Parallel Explore agents.** Rather than sequentially reading files and accumulating context, I launched multiple Explore subagents simultaneously — one to scan the project structure, another to read the PRD and configuration files. Each agent worked in isolation and returned a summary, keeping the main conversation context lean. This was critical because the repo had 43+ TypeScript files in the backend alone.

**2. Condensed reference documents.** The PRD (`docs/prd.md`) was approximately 1,000 lines — far too large to import into every conversation. Instead, I created `docs/prd-summary.md` at roughly 80 lines, containing only the key specs: API modes, auth model, data model, pricing tiers, and security requirements. This was added as an `@import` in CLAUDE.md, so Claude Code loads it automatically but at a fraction of the context cost. The full PRD remains available for deep dives when needed.

**3. Targeted file reads.** Instead of reading entire directories, I read specific files that I knew I needed: `app.ts` for route registration, `http.error.ts` for error classes, `password.ts` for existing utilities, `bunfig.toml` for test configuration. This prevented context bloat and kept responses focused.

One strategy I would use more in future sessions is `/compact` between major phases. After the exploration phase produced extensive file contents, compacting before the implementation phase would have freed up context for the more detailed coding work.

## Key Takeaways

1. **TDD through Claude Code is remarkably effective.** Writing tests first forced me to think about the API contract before implementation. The mocking strategy (PrismaClient, password utils, JWT) was planned during the Plan phase, so the test file was coherent from the start rather than accumulating hacks.

2. **The Explore phase catches what humans miss.** I would not have found the `@depvault/shared/api` reference in `.claude/rules/web/api-and-auth.md` manually — it was buried in a configuration file I rarely open. Systematic exploration surfaced it immediately.

3. **Commit messages as documentation.** Following Conventional Commits with `(red)` and `(green)` suffixes in TDD commits created a self-documenting git history. Anyone reviewing `git log --oneline` can immediately understand both the workflow and the feature's evolution.

4. **Configuration matters.** The `.claude/settings.json` with its PostToolUse hook (auto-formatting with Prettier on every edit) and permission allowlists (Bun commands, GitHub CLI, Playwright) made the workflow seamless. Without the Prettier hook, every commit would have required a manual formatting step.
