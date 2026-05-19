---
status: complete
priority: p1
issue_id: "034"
tags: [code-review, chatgpt-apps, widgets, map, data-contract]
dependencies: ["033"]
---

# Fix Trip Map Pin Data And Title

## Problem Statement

The new map widget can show the wrong destination title and can render no pins in live Mapbox mode for the normal server payload.

The server emits deterministic fallback coordinates as `{x, y}`, while the live Mapbox branch only renders markers for `{lat, lon}`. At the same time, the React map shell hardcodes "Amsterdam planning map", so a Venice trip can display an Amsterdam title.

## Findings

- `app/web/src/trip-components/TravelMap.tsx:146` hardcodes `title="Amsterdam planning map"`.
- `app/server/travel_agent/mcp.py:277` emits synthetic fallback coordinates with only `x` and `y`.
- `app/web/src/trip-components/TravelMap.tsx:39` filters live map markers to options with `lat` and `lon`.
- `app/web/src/trip-components/TravelMap.tsx:157` hides the fallback map when `VITE_MAPBOX_ACCESS_TOKEN` is set, so a configured live token can produce a base map with no saved-place pins.
- `app/server/travel_agent/mcp.py:639` says the tool renders saved places as map pins when precise coordinates are unavailable, which is only true for the local fallback path.

## Proposed Solutions

### Option 1: Make The Apps Map Explicitly Schematic

**Approach:** Use the trip title/destination dynamically, force the fallback pin renderer for server-produced `x/y` data, and update tool/resource wording to say "local/schematic pin map" when precise coordinates are unavailable.

**Pros:**
- Aligns implementation with current persisted trip data.
- Fixes the user-visible destination bug.
- Avoids fake geographic precision.

**Cons:**
- The map is not a true geographic map.

**Effort:** Small

**Risk:** Low

---

### Option 2: Add Real Coordinate Extraction

**Approach:** Extend trip item data to carry `lat/lon`, add geocoding or explicit coordinate parsing, then render live Mapbox only when coordinates exist.

**Pros:**
- Enables a real map.

**Cons:**
- Requires a new data contract and likely external service policy.

**Effort:** Large

**Risk:** Medium

## Recommended Action

Use Option 1 before merging PR #29. Create a separate feature plan for real geocoded maps.

## Technical Details

**Affected files:**
- `app/web/src/trip-components/TravelMap.tsx:39`
- `app/web/src/trip-components/TravelMap.tsx:146`
- `app/web/src/trip-components/TravelMap.tsx:157`
- `app/server/travel_agent/mcp.py:277`
- `app/server/travel_agent/mcp.py:639`

**Related components:**
- `render_trip_map`
- trip option payloads
- Mapbox/live map branch

**Database changes:** No

## Resources

- `docs/plans/2026-05-12-001-refactor-apps-sdk-pizzaz-travel-structure-plan.md`
- `docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md`

## Acceptance Criteria

- [x] Map widget title uses the current trip title or destination, not "Amsterdam".
- [x] Server-produced trip options include mock `lat/lon` plus local `x/y` coordinates.
- [x] Live Mapbox mode has marker coordinates for normal server payloads.
- [x] Tool and widget descriptions explain mock trip-area coordinates when exact coordinates are unavailable.
- [x] Browser smoke covers a Venice payload and asserts the rendered title and visible pins.

## Work Log

### 2026-05-19 - Code Review Discovery

**By:** Codex

**Actions:**
- Inspected `TravelMap` and the new server option payload helper.
- Confirmed the hardcoded Amsterdam title and the mismatch between server `x/y` coordinates and live `lat/lon` marker filtering.

**Learnings:**
- A map widget can be discoverable to ChatGPT and still fail the user promise if the tool description overstates the coordinate quality.

### 2026-05-19 - Fix Implemented

**By:** Codex

**Actions:**
- Replaced the hardcoded Amsterdam title with a trip-aware map title.
- Added deterministic mock coordinates centered on common destinations, including Venice.
- Preserved local fallback pins and live Mapbox marker rendering.

**Learnings:**
- Mock `lat/lon` pins are enough to validate the GPT Apps Mapbox path while real geocoding remains future scope.

## Notes

This is P1 because the PR is specifically intended to make the map available in GPT Apps, and the current implementation can show the wrong destination or no pins.
