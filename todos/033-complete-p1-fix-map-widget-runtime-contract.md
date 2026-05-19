---
status: complete
priority: p1
issue_id: "033"
tags: [code-review, chatgpt-apps, widgets, mapbox, csp, performance]
dependencies: []
---

# Fix Map Widget Runtime Contract

## Problem Statement

PR #29 registers a `render_trip_map` tool, but the generated map widget collapses the lazy Mapbox import into a 2.2 MB self-contained runtime template and still declares empty Apps SDK CSP domains.

This makes the map widget expensive to load and inconsistent with ChatGPT's hosted iframe contract. If a Mapbox token is present, the widget also attempts live Mapbox network requests without matching resource metadata.

## Findings

- `app/web/scripts/build-runtime-widgets.mjs:98` uses `inlineDynamicImports: true`, which defeats the lazy `await import("mapbox-gl")` path in `TravelMap`.
- `app/web/runtime_templates/trip_map_v1.html` is about 2,189,863 bytes raw and contains the full Mapbox runtime inline.
- `app/server/travel_agent/mcp.py:1060` registers the map widget with `connectDomains: []` and `resourceDomains: []`, while `TravelMap` can request Mapbox style, tile, glyph, sprite, and worker resources.
- `git diff --check origin/main...HEAD` fails on trailing whitespace in the generated Mapbox template.

Known Pattern: `docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md` says Mapbox must remain isolated from non-map paths, and `docs/solutions/integration-issues/apps-sdk-vite-widget-asset-delivery-and-bridge-contract-20260515.md` says widget resources must be either self-contained or explicitly hosted and allowlisted.

## Proposed Solutions

### Option 1: Force Apps Runtime to Local Map Preview

**Approach:** Keep the ChatGPT Apps `trip_map_v1` runtime on the local `x/y` fallback map only. Remove Mapbox from the runtime entry or gate it out of the MCP widget build.

**Pros:**
- Smallest and safest fix for this PR.
- Avoids Mapbox CSP, token, and worker complications in ChatGPT.
- Still satisfies "pin-based map renderer" using local pins.

**Cons:**
- No real geographic map until geocoded coordinates and CSP are designed.

**Effort:** Medium

**Risk:** Low

---

### Option 2: Support Live Mapbox Deliberately

**Approach:** Keep Mapbox live mode, but serve/split the Mapbox chunk deliberately, add required Apps SDK CSP domains, handle worker/blob behavior, and add production smoke coverage.

**Pros:**
- Enables real maps with real coordinates.

**Cons:**
- Larger scope and more deployment risk.
- Requires token handling and domain review.

**Effort:** Large

**Risk:** Medium

## Recommended Action

Final decision superseded the initial recommendation: support live Mapbox deliberately in this PR so GPT Apps can test the real map path now. The accepted contract is a self-contained map runtime template, explicit Mapbox CSP metadata, public `pk.*` runtime token delivery, and deterministic mock `lat/lon` pins until stored or geocoded coordinates exist.

## Technical Details

**Affected files:**
- `app/web/scripts/build-runtime-widgets.mjs:98`
- `app/web/src/trip-components/TravelMap.tsx:52`
- `app/server/travel_agent/mcp.py:1060`
- `app/web/runtime_templates/trip_map_v1.html`

**Related components:**
- Apps SDK widget resource CSP
- Vite runtime template build
- Mapbox token/runtime loading

**Database changes:** No

## Resources

- `docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md`
- `docs/solutions/integration-issues/apps-sdk-vite-widget-asset-delivery-and-bridge-contract-20260515.md`
- `todos/024-complete-p2-split-mapbox-from-shared-widget-bundle.md`

## Acceptance Criteria

- [x] User decision recorded: keep Mapbox bundled so GPT Apps can test the live map path now.
- [x] Map widget resource CSP declares Mapbox network/resource domains.
- [x] `git diff --check` passes for the working tree.
- [x] Server exposes only public `pk.*` Mapbox tokens to the widget and refuses `sk.*` tokens.
- [x] ChatGPT Apps can render visible local pins without a token and live Mapbox pins when a public token is configured.

## Work Log

### 2026-05-19 - Code Review Discovery

**By:** Codex

**Actions:**
- Reviewed PR #29 diff and generated runtime template sizes.
- Confirmed `trip_map_v1.html` is about 2.2 MB raw.
- Ran specialist review passes for performance, security, Apps SDK behavior, and prior learnings.

**Learnings:**
- The previous lazy Mapbox split is lost when MCP runtime templates are built with `inlineDynamicImports: true`.

### 2026-05-19 - Fix Implemented

**By:** Codex

**Actions:**
- Kept Mapbox in the Apps runtime per user request.
- Added Mapbox CSP domains to the map widget resource metadata.
- Added runtime public-token support from `MAPBOX_ACCESS_TOKEN` or `VITE_MAPBOX_ACCESS_TOKEN`.
- Updated the runtime widget builder to strip generated trailing whitespace.

**Learnings:**
- For GPT Apps testing, the practical contract is: bundled Mapbox runtime plus public runtime token plus mock `lat/lon` pins. Bundle size remains a known tradeoff.

## Notes

This is P1 because it directly affects the new map widget's hosted runtime viability and load behavior in ChatGPT Apps.
