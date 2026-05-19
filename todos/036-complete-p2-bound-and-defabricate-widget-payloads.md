---
status: complete
priority: p2
issue_id: "036"
tags: [code-review, performance, data-contract, widgets]
dependencies: []
---

# Bound And Defabricate Widget Payloads

## Problem Statement

The new option payload helper maps every saved trip item into every visual widget and fabricates presentation data such as scores, recommendations, pros/cons, placeholder media, and fallback coordinates.

Large trip workspaces can produce oversized `structuredContent`, and non-place planning fragments can become fake map pins or visual options.

## Findings

- `app/server/travel_agent/mcp.py:250` iterates over every item returned by `store.list_items(trip_id)` with no count cap.
- `app/server/travel_agent/mcp.py:268` copies raw content into widget descriptions without truncating display fields.
- `app/server/travel_agent/mcp.py:275` invents scores and recommendation ranking from item order.
- `app/server/travel_agent/mcp.py:277` gives every item fallback coordinates, even constraints and missing planning pieces.
- `app/server/travel_agent/mcp.py:294` creates placeholder media URLs for saved items regardless of whether they are visual places.

## Proposed Solutions

### Option 1: Normalize Saved Options Conservatively

**Approach:** Cap item count, truncate display strings, exclude constraints/missing pieces from place/map/media payloads, and move purely visual defaults into the React components.

**Pros:**
- Reduces payload size and model confusion.
- Keeps server output closer to persisted trip facts.

**Cons:**
- Some widgets may show fewer placeholder visuals until richer data is saved.

**Effort:** Medium

**Risk:** Low

---

### Option 2: Introduce Per-Widget Payload Builders

**Approach:** Build separate payloads for list/comparison/map/album/cart, each filtering and shaping data for its real purpose.

**Pros:**
- Most precise contracts.
- Avoids one helper trying to satisfy five widgets.

**Cons:**
- More code and more tests.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

Start with Option 1. Split builders later if the widgets diverge.

## Technical Details

**Affected files:**
- `app/server/travel_agent/mcp.py:247`
- `app/server/travel_agent/mcp.py:268`
- `app/server/travel_agent/mcp.py:275`
- `app/server/travel_agent/mcp.py:277`
- `app/server/travel_agent/mcp.py:294`

**Related components:**
- `render_trip_options`
- `render_trip_comparison`
- `render_trip_map`
- `render_trip_album`
- `render_trip_cart`

**Database changes:** No

## Resources

- `docs/plans/2026-05-12-001-refactor-apps-sdk-pizzaz-travel-structure-plan.md`

## Acceptance Criteria

- [x] New render tools cap returned items and truncate long display strings.
- [x] Constraint and missing-piece items do not become place pins or album media.
- [x] Server no longer fabricates score/pro/con fields for saved options.
- [x] Tests cover large raw item content and non-place item filtering.

## Work Log

### 2026-05-19 - Code Review Discovery

**By:** Codex

**Actions:**
- Reviewed `_trip_options_payload` and all new render tools.
- Compared implementation against prior Pizzaz plan guidance that map surfaces need useful location data.

**Learnings:**
- The current normalized option helper is useful, but it needs stronger boundaries before becoming the shared contract for every visual widget.

### 2026-05-19 - Fix Implemented

**By:** Codex

**Actions:**
- Capped visual option payloads at 24 items.
- Truncated widget display strings.
- Filtered non-place planning items out of visual option/media/map payloads.
- Removed fabricated scores and pros/cons from server output.

**Learnings:**
- Mock coordinates are acceptable for testing a map renderer, but fabricated ranking content is not useful model-visible state.

## Notes

This is P2 because it affects payload size and user trust, especially in GPT Apps where structured content is part of the model-visible contract.
