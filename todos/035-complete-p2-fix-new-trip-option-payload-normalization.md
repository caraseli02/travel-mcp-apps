---
status: complete
priority: p2
issue_id: "035"
tags: [code-review, python, widgets, data-contract]
dependencies: []
---

# Fix New Trip Option Payload Normalization

## Problem Statement

The new `render_trip_options`, `render_trip_comparison`, `render_trip_map`, `render_trip_album`, and `render_trip_cart` tools build option payloads with several normalization bugs.

Prices do not parse, cart currency is hardcoded, and canonical `transport` trip items are misclassified as activities.

## Findings

- `app/server/travel_agent/mcp.py:259` uses a raw regex with double-escaped `\\s`, `\\d`, and `\\.`. Normal prices like `EUR 12.50`, `$42`, and `€15` all parse as `None`.
- `app/server/travel_agent/mcp.py:308` hardcodes cart currency to `EUR`, even though individual option currency is inferred from item text.
- `app/server/travel_agent/mcp.py:232` maps `transit` and `train`, but not the app's canonical `transport` item type, so saved transport items render as `activity`.

## Proposed Solutions

### Option 1: Reuse Existing Budget Parsing Patterns

**Approach:** Move price/currency extraction to a small shared helper or reuse the existing budget extraction logic. Add canonical item type mapping for `transport`.

**Pros:**
- Keeps widget payloads consistent with budget behavior.
- Small implementation.

**Cons:**
- Still only parses simple prices from text.

**Effort:** Small

**Risk:** Low

---

### Option 2: Add Structured Price Fields To Trip Items

**Approach:** Extend saved trip items with normalized `amount` and `currency` fields, and migrate render/budget tools to those fields.

**Pros:**
- More robust long-term data model.

**Cons:**
- Larger schema/storage change.

**Effort:** Large

**Risk:** Medium

## Recommended Action

Use Option 1 for this PR. The new widgets should not regress basic price, currency, or transport display.

## Technical Details

**Affected files:**
- `app/server/travel_agent/mcp.py:232`
- `app/server/travel_agent/mcp.py:259`
- `app/server/travel_agent/mcp.py:308`
- `tests/test_travel_agent_server.py`

**Related components:**
- trip budget parsing
- trip cart widget
- option/category filters

**Database changes:** No

## Resources

- `app/server/services/trips.py`
- `tests/test_travel_agent_server.py`

## Acceptance Criteria

- [x] Currency-prefixed/suffixed prices parse for the new option/cart payloads.
- [x] Cart currency is derived consistently and mixed-currency cases return `MIXED`.
- [x] `transport` trip items render under the transit category, not activity.
- [x] Server tests cover the new render payload normalization.

## Work Log

### 2026-05-19 - Code Review Discovery

**By:** Codex

**Actions:**
- Confirmed the regex returns `None` for representative price strings.
- Ran Python-focused review on the new payload helper.

**Learnings:**
- The new widget payload path needs behavior tests, not only resource HTML tests.

### 2026-05-19 - Fix Implemented

**By:** Codex

**Actions:**
- Replaced the broken double-escaped price regex.
- Added transport category mapping.
- Added mixed-currency cart handling and tests.

**Learnings:**
- The cart/list/map widgets should share one conservative display-normalization path until a richer trip item schema exists.

## Notes

This is P2 because the widgets render, but their displayed prices/categories are wrong.
