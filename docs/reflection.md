# HW4 Reflection - Claude Code Workflow & TDD

## How does the Explore→Plan→Implement→Commit workflow compare to your previous approach?

My usual process is: skim the code, start building, fix stuff as it breaks. That works for small changes but I always end up backtracking on bigger features.

The Explore phase caught things I would have missed. Running Glob and Grep systematically across the codebase surfaced inconsistencies in config files, stale references in documentation, and gaps in the database schema before I wrote a single line of code. One example: there was a wrong package import buried in `.claude/rules/` that I never would have found by hand; it's in a config file I don't open. Without structured exploration, I'd have been debugging weird import errors 30 minutes into implementation.

Plan mode was honestly the part I expected to blow past. Instead it turned out to be the most valuable step. Writing out the plan forced real decisions: auth+user module or metadata scraper? Condense the 1000-line PRD or import the whole thing? What's the mocking strategy for tests? I normally figure that stuff out while coding, and the results are inconsistent. Having the plan written down meant I knew commit 3 would be failing tests, commit 4 would make them pass, and so on. No guessing.

Planning commits ahead of time also changed how the work felt. Instead of vaguely working on "the auth feature," each step had a specific goal: write 4 tests, make them green, next cycle. By the time I hit the refactor commit, the duplication across register/login/refresh was obvious because I'd just built all three.

For a one-line fix, this whole workflow is too much. But for anything that spans multiple files, the upfront time saved me from the kind of rework I usually end up doing.

## What context management strategies worked best?

Context limits are a real constraint, and I had to be more deliberate about them than I expected.

Parallel Explore agents were the biggest win. Instead of reading files one at a time and filling the conversation with raw content, I launched two subagents at once: one for the project structure and backend files, the other for the PRD and configuration. Each returned a summary. The backend has 43+ TypeScript files, so dumping those into the main conversation would have been a problem.

Creating a condensed PRD also helped a lot. The full `docs/prd.md` runs about 1,000 lines. Most conversations only need the API spec, auth model, and data schema, so I wrote `docs/prd-summary.md` at ~80 lines and added it as an `@import` in CLAUDE.md. Claude Code loads it automatically, and the full version is there when I need to look up pricing details or launch timeline.

Beyond that, I tried to only read files I actually needed: `app.ts` for route registration, `http.error.ts` for error classes, `bunfig.toml` for test setup. Browsing whole directories is tempting but wasteful.

Something I'd do differently next time: run `/compact` between exploring and implementing. The exploration phase pulled in a lot of file content that just sat there taking up space once I started writing code.

## What I learned

Writing tests first through Claude Code went better than expected, and I think the reason is that it forces you to define mocks and expected behavior before you write the implementation. I planned the PrismaClient mocking approach during Plan mode, so the test file was coherent from the start instead of accumulating workarounds.

The git history became documentation on its own. Tagging TDD commits with `(red)` and `(green)` means you can run `git log --oneline` and read the feature's story without opening any files.

The `.claude/settings.json` setup mattered more than I initially thought. There's a PostToolUse hook that auto-formats every edit with Prettier, so I never dealt with formatting before commits. The permission allowlists for Bun and GitHub CLI commands cut down on approval prompts. Small things, but across 12+ commits in one session, they add up.
