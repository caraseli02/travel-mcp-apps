---
status: complete
priority: p1
issue_id: "013"
tags: [code-review, release, packaging]
dependencies: []
---

# Include Relocated Runtime Files

## Problem Statement

The branch deletes the old top-level runtime packages and updates imports to `app.server...`, but the relocated `app/server/` and `app/web/` trees are currently untracked. If the merge only contains the tracked diff, `app.main` will import modules that do not exist.

## Findings

- `app/mcp_mounts.py` imports MCP servers from `app.server.*`.
- `app/routers/health.py` and `app/routers/travel.py` import clients from `app.server.clients`.
- `git status --short` shows `?? app/server/` and `?? app/web/`.
- The old `mcp_servers/`, `mcp_clients/`, `services/`, and `sample_data/` trees are deleted.

## Proposed Solutions

### Option 1: Stage the New Runtime Trees

**Approach:** Add all intended files under `app/server/` and `app/web/`, including built widget assets that are required at runtime.

**Pros:**
- Preserves the new structure exactly as implemented.
- Keeps FastAPI Cloud source deploys working.

**Cons:**
- Requires careful review of generated files before staging.

**Effort:** Small

**Risk:** Low

---

### Option 2: Temporarily Restore Legacy Imports

**Approach:** Restore legacy packages or compatibility shims until the new trees are fully committed.

**Pros:**
- Reduces immediate merge risk.

**Cons:**
- Conflicts with the explicit cleanup direction.
- Reintroduces legacy layout.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `app/mcp_mounts.py`
- `app/routers/health.py`
- `app/routers/travel.py`
- `app/server/**`
- `app/web/**`

## Resources

- Code review finding from kieran-python-reviewer.

## Acceptance Criteria

- [ ] `git status --short` shows the relocated runtime files as tracked additions, not untracked.
- [ ] `python -c "from app.main import app"` succeeds from a clean checkout.
- [ ] `python -m pytest tests` passes with expected environment.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Reviewed current branch status and import paths.
- Confirmed the new runtime files are still untracked.

**Learnings:**
- This is a merge hygiene blocker, not a runtime bug in the working tree.

