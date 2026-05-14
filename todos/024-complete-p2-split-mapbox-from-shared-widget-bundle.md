---
status: complete
priority: p2
issue_id: "024"
tags: [code-review, performance, frontend, bundle-size]
dependencies: []
---

# Split Mapbox from Shared Widget Bundle

`mapbox-gl` is statically imported by the shared trip component entry, so every consumer of `component.js` pays the Mapbox cost even when rendering inbox, budget, itinerary, album, cart, or clarification components.

## Problem Statement

The branch adds a real Mapbox map, which is valuable for a travel planner, but it currently inflates the shared component bundle. This hurts load time for non-map widgets and makes future ChatGPT Apps iframe rendering more expensive.

## Findings

- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:2) imports `mapbox-gl` at module scope.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:3) imports Mapbox CSS at module scope.
- `npm run check` built [component.js](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/dist/component.js) at about 2.6 MB reported by Vite and 3.5 MB on disk, with 593 KB gzip.
- Storybook also reports a large `travelFixtures` preview chunk of about 1.87 MB.

## Proposed Solutions

### Option 1: Lazy Load Mapbox Inside TravelMap

**Approach:** Remove the top-level `mapbox-gl` import and dynamically import Mapbox only when `TravelMap` mounts. Keep a local loading state and fallback map until the module resolves.

**Pros:**
- Non-map components stop paying the Mapbox JavaScript cost.
- Keeps the map component available in the same API.
- Low impact on existing story structure.

**Cons:**
- Requires async initialization and cleanup care.
- CSS import handling may need a Vite-supported strategy.

**Effort:** 2-4 hours

**Risk:** Medium

---

### Option 2: Split TravelMap into a Separate Entry

**Approach:** Build the map component as a separate entry/chunk and keep the rest of the trip component bundle lightweight.

**Pros:**
- Clear bundle boundary.
- Better long-term scaling if map grows.

**Cons:**
- Requires build and resource registration changes.
- More invasive for consumers.

**Effort:** 4-6 hours

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:2)
- [vite.config.ts](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/vite.config.ts:6)
- [package.json](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/package.json:43)

Related components:
- `TravelMap`
- `component.js` library build
- Storybook preview chunks

Database changes: No

## Resources

- Review target: current branch `codex/feat-pizzaz-storybook-gallery`
- Build evidence: `npm run check` Vite output from 2026-05-14

## Acceptance Criteria

- [x] Non-map trip components can render without loading Mapbox JavaScript.
- [x] Map story still renders a live Mapbox map with markers when selected.
- [x] Bundle-size output is captured before and after the change.
- [x] `npm run check` passes.
- [x] Browser smoke covers `options-list`, `album`, `cart`, and `map`.

## Work Log

### 2026-05-14 - Code Review Discovery

**By:** Codex

**Actions:**
- Reviewed the package and Vite build output.
- Confirmed `mapbox-gl` is imported at the shared module top level.
- Measured generated artifact size from `npm run check` and `du`.

**Learnings:**
- Restoring the old Pizza map behavior solved visual correctness but moved a heavy map dependency into every trip component consumer.

### 2026-05-14 - Completed

**By:** Codex

**Actions:**
- Moved Mapbox into a dynamic import inside `TravelMap`.
- Kept Mapbox CSS available through `index.css`.
- Added a map-ready signal so markers install after the lazy module resolves.
- Verified build output now splits the shared component entry, non-map implementation chunk, and Mapbox chunk.

**Learnings:**
- Lazy map loading needs a readiness state because refs do not trigger React effects when async initialization completes.
