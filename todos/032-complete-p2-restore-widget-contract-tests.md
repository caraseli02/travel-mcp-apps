---
status: complete
priority: p2
issue_id: "032"
tags: [code-review, tests, chatgpt-apps, widgets, regression]
dependencies: []
---

# Restore Widget Contract Tests

## Problem Statement

The widget resource tests were relaxed during the Vite migration and no longer catch several Apps SDK contract regressions: Vite-backed widgets can reference external assets, and the clarification widget no longer has tests for submit/follow-up/close bridge markers.

This allowed the broken submit payload and multi-file asset delivery risks to pass local Python tests.

## Findings

- `tests/test_apps_ui_resources.py` now checks Vite widgets only for `<script type="module" crossorigin src=` and `<div id="root"></div>`.
- The previous `test_trip_clarification_resource_includes_submit_and_close_bridge` assertions for `submit_trip_clarification`, `requestClose`, `callTool`, `sendFollowUpMessage`, `setWidgetState`, `ui/message`, `tools/call`, and `{prompt:text}` were removed.
- `tests/test_travel_agent_server.py:453` now asserts only that every registered travel widget HTML includes a module script and root div.
- Python tests passed even though `npm run typecheck` failed and the React widget submits the wrong tool args.

Known Pattern: `docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md` warns that Storybook/static shape checks are not enough for actual Apps bridge lifecycle behavior.

## Proposed Solutions

### Option 1: Add Built-Artifact Contract Tests

**Approach:** After build, parse generated widget HTML and verify every referenced JS/CSS asset exists, is packaged or inlined, and is allowed by the widget delivery strategy. Add clarification-specific assertions against the built JS or source component for required bridge calls and payload keys.

**Pros:**
- Directly covers the new Vite output.
- Catches missing assets and bridge drift before deployment.

**Cons:**
- Built JS string assertions can be brittle unless scoped carefully.

**Effort:** Medium

**Risk:** Low

---

### Option 2: Add React-Level Tests for Widget Bridge Behavior

**Approach:** Use Vitest/React Testing Library or existing browser tooling to mount `TripClarification`, mock `window.openai`, interact with controls, and assert `callTool`, `setWidgetState`, `sendFollowUpMessage`, and `requestClose` behavior.

**Pros:**
- Tests behavior instead of generated string markers.
- Easier to evolve with Vite output.

**Cons:**
- Requires adding or configuring a React test harness.

**Effort:** Medium

**Risk:** Medium

---

### Option 3: Use Browser Smoke Tests Against Built Widgets

**Approach:** Serve the built widgets locally, inject mock `window.openai` data, and run Playwright smoke tests for each widget plus a submit flow.

**Pros:**
- Highest confidence in runtime behavior.
- Can catch blank-root and interaction issues.

**Cons:**
- Slower and heavier than unit/static checks.

**Effort:** Large

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `tests/test_apps_ui_resources.py:31` - Vite widget test expectations
- `tests/test_travel_agent_server.py:453` - registered widget resource assertions
- `app/web/src/trip-components/TripClarification.tsx` - behavior no longer covered by Python tests

**Related components:**
- Apps SDK bridge contract
- Vite widget build output
- Python MCP resource tests
- Storybook/static validation

**Database changes:** No

## Resources

- `docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md`
- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md`
- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md`

## Acceptance Criteria

- [ ] Tests fail if a registered widget references assets that cannot be served or packaged.
- [ ] Tests fail if clarification submit no longer calls the expected tool with the expected payload keys.
- [ ] Tests cover widget close/follow-up behavior or explicitly document why that is deferred to browser tests.
- [ ] Python tests and widget package checks both pass after fixes.
- [ ] The test names describe the Apps SDK contract being protected.

## Work Log

### 2026-05-15 - Code Review Discovery

**By:** Claude Code

**Actions:**
- Reviewed changes to `tests/test_apps_ui_resources.py` and `tests/test_travel_agent_server.py`.
- Ran `.venv/bin/pytest tests/test_apps_ui_resources.py tests/test_travel_agent_server.py`, which passed.
- Compared passing tests with TypeScript and bridge contract failures found during review.

**Learnings:**
- Current Python tests validate document shape but not hosted widget runtime viability.

### 2026-05-15 - Fix Implemented

**By:** Claude Code

**Actions:**
- Added Vite widget tests for self-contained resource HTML.
- Restored clarification bridge contract assertions for submit, close, follow-up, widget state, `tools/call`, and `ui/message`.
- Updated unified server resource tests to reject unresolved Vite asset tags and static chunk imports.

**Learnings:**
- The resource tests should verify the Apps SDK delivery contract, not merely the presence of a root div and module script.

## Notes

This is P2 because it is a coverage gap rather than the runtime bug itself, but it allowed multiple P1 regressions through.
