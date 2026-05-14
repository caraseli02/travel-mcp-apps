---
status: complete
priority: p2
issue_id: "026"
tags: [code-review, apps-sdk, widget-state, known-pattern]
dependencies: []
---

# Persist Interactive Widget State

The new React trip components keep selected tabs, selected options, album feedback, cart quantities, and similar interaction state only in local React state. That is fine for a static Storybook preview, but it is fragile once these components become Apps SDK widgets hosted by ChatGPT.

## Problem Statement

ChatGPT Apps hosts can replay tool output and repaint iframes. Meaningful UI state that should survive host updates needs to be persisted through the Apps widget state API. The current implementation risks losing user choices when the host refreshes the widget or replays the original tool output.

## Findings

- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:282) stores option filters and selected option only in local state.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:361) stores carousel filter/index only in local state.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:468) stores map filter and selection only in local state.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:623) stores album selected item and attach feedback only in local state.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:772) stores cart quantity edits only in local state.
- Known Pattern: [apps-sdk-clarification-widget-state-and-schema-contract-20260511.md](/Users/vladislavcaraseli/Documents/travel-mcp-app/docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md) documents a previous clarification widget bug where local-only state was lost after Apps host replays.

## Proposed Solutions

### Option 1: Add a Shared Apps Widget State Hook

**Approach:** Create a small hook that reads `window.openai.widgetState`, scopes state by component/trip id, and writes through `window.openai.setWidgetState` when available. Fall back to React local state in Storybook.

**Pros:**
- Reusable across all trip components.
- Keeps Storybook behavior intact.
- Aligns with the previous known solution.

**Cons:**
- Requires a small bridge typing layer.
- Needs careful state namespacing to avoid component collisions.

**Effort:** 4-6 hours

**Risk:** Medium

---

### Option 2: Keep Components Presentation-Only Until Runtime Integration

**Approach:** Document that these are Storybook-only previews and defer widget-state integration until they are connected to real Apps SDK resources.

**Pros:**
- Avoids adding bridge code prematurely.
- Keeps current visual review scope narrow.

**Cons:**
- Easy to forget before promotion to production widget resources.
- The branch already exports these components from the shared web entry, so future users may treat them as runtime-ready.

**Effort:** 1 hour

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:282)
- [TripClarification.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TripClarification.tsx:14)
- [component.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/component.tsx:1)

Related components:
- Apps SDK widget bridge
- Chat preview stories
- Future trip widget resources

Database changes: No

## Resources

- Known Pattern: [Apps SDK clarification widget state and schema contract](/Users/vladislavcaraseli/Documents/travel-mcp-app/docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md)
- Related guidance: [Storybook widget preview v3 UI drift](/Users/vladislavcaraseli/Documents/travel-mcp-app/docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md)

## Acceptance Criteria

- [x] Decide whether these components are Storybook-only or runtime-ready.
- [x] If runtime-ready, selected/filter/cart state persists through `window.openai.widgetState` when the host bridge is available.
- [x] Storybook still works without `window.openai`.
- [x] Browser smoke verifies the stories still work without an Apps bridge.
- [x] `npm run check` passes.

## Work Log

### 2026-05-14 - Code Review Discovery

**By:** Codex

**Actions:**
- Reviewed new interactive travel components against prior Apps SDK widget lifecycle learnings.
- Identified local-only state in all transformed travel components.
- Linked this risk to the previous clarification widget replay issue.

**Learnings:**
- The visual transformation is useful, but runtime Apps SDK promotion needs an explicit bridge-state decision.

### 2026-05-14 - Completed

**By:** Codex

**Actions:**
- Added a shared `useWidgetState` hook that persists state through `window.openai.widgetState` and `window.openai.setWidgetState` when available.
- Applied it to options list filters/selection, comparison filter/index, map filter/selection, album selection/feedback, and cart quantities/feedback.
- Verified Storybook still works without `window.openai`.

**Learnings:**
- Widget-state persistence can be introduced as a progressive enhancement without making Storybook depend on the Apps host bridge.
