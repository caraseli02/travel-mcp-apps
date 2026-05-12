---
status: complete
priority: p2
issue_id: "017"
tags: [code-review, ci, widgets, security]
dependencies: []
---

# Include Server Widgets In CI Paths

## Problem Statement

The Storybook workflow only runs for `app/web/**`, but MCP endpoints also expose HTML from `app/server/widgets/**`. Changes to those public widget resources can bypass the widget CI gate.

## Findings

- `.github/workflows/widgets-storybook.yml` filters on `app/web/**`.
- `app/server/weather/mcp.py`, `app/server/travel_tips/mcp.py`, and `app/server/packing/mcp.py` serve HTML from `app/server/widgets`.
- These resources use `text/html;profile=mcp-app` and are public ChatGPT Apps surfaces.

## Proposed Solutions

### Option 1: Add `app/server/widgets/**` To Workflow Paths

**Approach:** Update the workflow path filter so widget checks run when server widget HTML changes.

**Pros:**
- Small change.
- Closes CI coverage gap.

**Cons:**
- Storybook does not currently preview those server widgets after cleanup.

**Effort:** Small

**Risk:** Low

---

### Option 2: Move Exposed Widget HTML Under `app/web`

**Approach:** Put all HTML widget assets under one checked web package and have server modules read from there.

**Pros:**
- Single widget surface.
- Easier Storybook ownership.

**Cons:**
- Larger file move.
- Requires import/resource path updates.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `.github/workflows/widgets-storybook.yml`
- `app/server/widgets/**`
- `app/server/weather/mcp.py`
- `app/server/travel_tips/mcp.py`
- `app/server/packing/mcp.py`

## Resources

- Security review finding.

## Acceptance Criteria

- [ ] Changes under `app/server/widgets/**` trigger widget CI.
- [ ] CI still runs `npm run check` for `app/web`.
- [ ] Documentation reflects where each widget family lives.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Reviewed GitHub Actions path filters against runtime widget readers.

**Learnings:**
- The new folder split creates a CI blind spot for legacy-but-exposed widgets.

