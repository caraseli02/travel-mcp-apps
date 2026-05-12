---
status: complete
priority: p2
issue_id: "016"
tags: [code-review, apps-sdk, widgets]
dependencies: []
---

# Align Widget Resource Versions

## Problem Statement

Some registered `ui://` resource URIs advertise older versions while serving newer versioned HTML files. That can confuse Apps SDK cache-busting and make ChatGPT reuse stale widget templates.

## Findings

- `ui://trip/board-v2.html` serves `trip_board_v3.html`.
- `ui://trip/itinerary-v1.html` serves `trip_itinerary_v3.html`.
- `ui://trip/budget-v1.html` serves `trip_budget_v3.html`.
- Known pattern from `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md`: keep `ui://` versions, Storybook URLs, and resource readers in lockstep when contracts change.

## Proposed Solutions

### Option 1: Bump Resource URIs To Match Served Files

**Approach:** Register `ui://trip/board-v3.html`, `ui://trip/itinerary-v3.html`, and `ui://trip/budget-v3.html`, and update tool metadata/tests/docs.

**Pros:**
- Clear cache-busting.
- Matches file names and docs.

**Cons:**
- Existing ChatGPT app configuration references may need updating.

**Effort:** Medium

**Risk:** Medium

---

### Option 2: Rename Served Files To Match Stable URIs

**Approach:** Keep public URIs stable and serve files with matching names.

**Pros:**
- Avoids user-visible app config changes.

**Cons:**
- Hides material widget version changes unless documented.

**Effort:** Small

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `app/server/travel_agent/mcp.py`
- `app/web/*.html`
- `app/web/.storybook/main.ts`
- `app/web/scripts/copy-widgets-to-dist.mjs`
- `tests/test_api.py`
- `tests/test_apps_ui_resources.py`
- `docs/testing_chatgpt_apps.md`

## Resources

- Known pattern: `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md`

## Acceptance Criteria

- [ ] Every `ui://trip/...-vN.html` URI serves a same-version HTML file or has an explicit compatibility comment.
- [ ] Tool metadata `_meta["openai/outputTemplate"]` matches the registered resource URI.
- [ ] Tests and docs use the same resource names.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Compared resource registrations with served filenames.
- Cross-checked prior solution docs for widget version drift.

**Learnings:**
- The refactor preserved working behavior but also preserved historical version drift.

