---
status: complete
priority: p3
issue_id: "022"
tags: [code-review, cleanup, docs]
dependencies: []
---

# Clean Stale Refactor Leftovers

## Problem Statement

Several non-protected files still reference deleted paths or legacy artifacts after the move to `app/server` and `app/web`.

## Findings

- `.gitignore` still unignores PNGs under deleted `mcp_servers/widgets/stories/**`.
- `sprint_4_quickstart_checklist.md` references `mcp_servers/` and `mcp_clients/`.
- `sprint_4_travel_planner_prompt.md` references the removed layout.
- Storybook still emits `trip_inbox_v1.html` even though current stories use `trip_inbox_v2.html`.
- Protected `docs/plans` and `docs/solutions` were intentionally not flagged for deletion.

## Proposed Solutions

### Option 1: Update Or Remove Stale Root Docs

**Approach:** Either update root-level sprint docs to current paths or delete them if they are no longer useful.

**Pros:**
- Reduces onboarding confusion.

**Cons:**
- Requires deciding whether sprint docs are historical or operational.

**Effort:** Small

**Risk:** Low

---

### Option 2: Keep Historical Docs But Mark Them Archived

**Approach:** Add a clear note that the docs predate the `app/server` refactor.

**Pros:**
- Preserves history.

**Cons:**
- Leaves stale path examples in the repo.

**Effort:** Small

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `.gitignore`
- `sprint_4_quickstart_checklist.md`
- `sprint_4_travel_planner_prompt.md`
- `app/web/.storybook/main.ts`

## Resources

- Code-simplicity review findings.

## Acceptance Criteria

- [ ] Non-protected operational docs no longer instruct use of deleted folders.
- [ ] `.gitignore` no longer contains stale deleted widget paths.
- [ ] Storybook whitelist contains only currently supported widget HTML files.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Searched runtime docs and ignore rules for deleted-path references.

**Learnings:**
- The important historical docs are protected, but root operational docs should match the current structure.

