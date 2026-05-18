---
status: complete
priority: p2
issue_id: "031"
tags: [code-review, chatgpt-apps, widgets, state, reliability]
dependencies: []
---

# Persist React Widget State

## Problem Statement

The new React clarification widget keeps answers and submit state only in local React state. ChatGPT Apps can replay `toolOutput` and remount or refresh widget globals, so meaningful interaction state needs to use `window.openai.widgetState` and `window.openai.setWidgetState`.

Without persistence, users can lose selected answers or be reset to the initial question during host updates.

## Findings

- `TripClarification.tsx:20` stores `currentIndex`, `submitted`, and `answers` in local component state.
- `TripClarification.tsx:27` resets `currentIndex` and `submitted` whenever the incoming clarification session/current index dependencies change.
- `TripClarification.tsx:24` initializes `answers` to `{}` and never restores from host widget state.
- Existing `useWidgetState` is used elsewhere, but the clarification widget does not use it for answers or submit state.
- Prior solution docs identify this exact ChatGPT Apps replay behavior as a root cause of inert/resetting clarification flows.

Known Pattern: `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md` recommends persisting session ID, current index, answers, and submit state through the Apps widget state API.

## Proposed Solutions

### Option 1: Extend `useWidgetState` for Session-Scoped Objects

**Approach:** Use or extend the existing `useWidgetState` hook to store `{ session_id, index, answers, submitState }` and restore it only when the saved `session_id` matches the current clarification session.

**Pros:**
- Reuses existing project pattern.
- Handles host replays without adding a new store.
- Keeps state scoped to the current clarification session.

**Cons:**
- Requires careful migration for nested answer objects.

**Effort:** Medium

**Risk:** Low

---

### Option 2: Create a Dedicated Clarification State Hook

**Approach:** Add `useClarificationWidgetState` that owns restoration, persistence, and reset rules for this widget only.

**Pros:**
- Keeps the complex session matching logic out of the component.
- Easier to unit test.

**Cons:**
- Adds a new hook for a single widget.

**Effort:** Medium

**Risk:** Low

---

### Option 3: Move the Flow Back to Server-Driven State

**Approach:** Persist answers server-side after every step and re-render from server state.

**Pros:**
- Strong durability.
- Reduces client state responsibility.

**Cons:**
- Bigger architecture change.
- Not necessary for the current transient clarification flow.

**Effort:** Large

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `app/web/src/trip-components/TripClarification.tsx:20` - local-only flow state
- `app/web/src/trip-components/useWidgetState.ts` - existing host state helper
- `app/web/src/bridge/useToolOutput.ts` - reacts to host tool output/global updates

**Related components:**
- ChatGPT Apps widget state API
- Clarification answer collection
- Host replay behavior

**Database changes:** No

## Resources

- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md`

## Acceptance Criteria

- [ ] Current question index persists across host global updates for the same session.
- [ ] Answers persist across host global updates for the same session.
- [ ] Submit/review state persists or resets intentionally based on session ID.
- [ ] A new clarification session does not inherit answers from a previous session.
- [ ] Tests cover restoration and reset behavior.

## Work Log

### 2026-05-15 - Code Review Discovery

**By:** Claude Code

**Actions:**
- Inspected `TripClarification` state handling.
- Compared the new React implementation with prior Apps SDK widget state guidance.

**Learnings:**
- The new component captures answers locally but has not yet restored the previous `setWidgetState` safety behavior.

### 2026-05-15 - Fix Implemented

**By:** Claude Code

**Actions:**
- Added session-scoped widget state restoration for current index, answers, and submit state.
- Persisted state transitions and answer changes through `window.openai.setWidgetState`.
- Reset restored state when the host provides a different clarification session.

**Learnings:**
- State persistence needs to be keyed by `session_id` so old answers do not leak into a new clarification flow.

## Notes

This is P2 because it may appear intermittently depending on host replay timing, but it is a known reliability problem for ChatGPT Apps widgets.
