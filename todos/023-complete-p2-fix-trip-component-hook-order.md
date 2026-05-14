---
status: complete
priority: p2
issue_id: "023"
tags: [code-review, react, quality, storybook]
dependencies: []
---

# Fix Trip Component Hook Order

Several trip components return early for error data before all hooks are called. If Storybook controls or a ChatGPT Apps host repaint the same mounted component from a valid payload to an error payload, React can hit a hook-order mismatch and throw at runtime.

## Problem Statement

The new Apps SDK UI trip components need to tolerate Storybook state toggles and host-driven tool output changes. Components that sometimes call hooks and sometimes return before those hooks violate React's hook rules, which can break the preview surface exactly when testing error states.

## Findings

- [TripItinerary.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TripItinerary.tsx:21) returns for `isError(itinerary)` before calling `useState` at lines 31-32.
- [TripBoard.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TripBoard.tsx:48) returns for `isError(board)` before calling `useState` at line 68.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:365) returns for `isError(data)` before calling `useEffect` at line 377 in `TravelComparisonCarousel`.
- These are not caught by `tsc` or the current static Storybook build because those checks do not toggle the same mounted story instance between default and error payloads.

## Proposed Solutions

### Option 1: Move Hooks Above Error Returns

**Approach:** Compute `error = isError(...)`, call hooks unconditionally with safe fallback data, then return the error shell after hooks.

**Pros:**
- Minimal code change.
- Matches the current `TravelMap` pattern.
- Keeps components resilient to Storybook control changes.

**Cons:**
- Requires careful fallback values for typed data.

**Effort:** 1-2 hours

**Risk:** Low

---

### Option 2: Split Error Wrappers from Stateful Inner Components

**Approach:** Keep top-level components as pure validators that return error/empty shells or delegate to inner stateful components only for valid data.

**Pros:**
- Strong separation between error handling and interactive UI.
- Avoids safe fallback plumbing.

**Cons:**
- More component files or local component definitions.
- Slightly larger refactor.

**Effort:** 2-4 hours

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [TripItinerary.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TripItinerary.tsx:21)
- [TripBoard.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TripBoard.tsx:48)
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:365)

Related components:
- Storybook `Trip Components/Apps SDK UI` state control
- Chat preview widget rendering

Database changes: No

## Resources

- Review target: current branch `codex/feat-pizzaz-storybook-gallery`
- React hooks rule: hooks must be called in the same order on every render

## Acceptance Criteria

- [x] `TripBoard`, `TripItinerary`, and `TravelComparisonCarousel` call hooks in a stable order across default, empty, and error states.
- [x] Storybook can toggle affected stories between default and error states without console hook-order errors.
- [x] `npm run check` passes.
- [x] Browser smoke covers at least one default-to-error toggle for affected stories.

## Work Log

### 2026-05-14 - Code Review Discovery

**By:** Codex

**Actions:**
- Reviewed the current branch diff and trip component implementations.
- Identified conditional hook paths in newly added React components.
- Verified the issue is not covered by the current build/typecheck path.

**Learnings:**
- Static Storybook build is insufficient for hook-order regressions caused by interactive control changes.

### 2026-05-14 - Completed

**By:** Codex

**Actions:**
- Moved `TripBoard` and `TripItinerary` hook calls before their error returns using safe fallback data.
- Split `TravelComparisonCarousel` into its own component module and kept hooks stable before error rendering.
- Ran `npm run check` and browser smoke for board/itinerary error stories with no console errors.

**Learnings:**
- Error shells should be treated as render branches after hooks, not as pre-hook exits, for mounted Storybook controls and Apps host replays.
