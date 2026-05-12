---
status: complete
priority: p2
issue_id: "019"
tags: [code-review, apps-sdk, ux, widgets]
dependencies: []
---

# Wire Or Remove Trip Board Action

## Problem Statement

The Trip Board widget shows a `Resolve next gap` button, but the button has no click handler and no bridge path. Users see an action that cannot do anything.

## Findings

- `app/web/trip_board_v3.html` renders `<button class="btn" type="button">Resolve next gap</button>`.
- The script handles initial tool output, message updates, and `openai:set_globals`.
- There is no `click` handler, `window.openai.callTool`, `window.openai.sendFollowUpMessage`, `ui/message`, or widget-state path for the button.

## Proposed Solutions

### Option 1: Remove The Button

**Approach:** Delete the inert button until a real action is defined.

**Pros:**
- Fastest fix.
- Avoids misleading UI.

**Cons:**
- Loses a useful intended affordance.

**Effort:** Small

**Risk:** Low

---

### Option 2: Wire The Button To A Follow-Up Message

**Approach:** Use the Apps SDK bridge to ask ChatGPT to resolve the next gap for the current trip.

**Pros:**
- Preserves the intended action.
- Keeps model in the loop.

**Cons:**
- Needs fallback behavior in Storybook and tests.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `app/web/trip_board_v3.html`
- `app/web/stories/TripBoard.stories.ts`
- `tests/test_apps_ui_resources.py`

## Resources

- Agent-native review finding.

## Acceptance Criteria

- [ ] Trip Board has no inert controls.
- [ ] If the action remains, Storybook covers the bridge path or fallback.
- [ ] Widget still renders correctly in ChatGPT Apps host simulation.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Reviewed widget UI actions and bridge usage.

**Learnings:**
- App widgets should not expose actions that an agent cannot observe or execute.

