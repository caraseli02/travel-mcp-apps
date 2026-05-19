---
status: complete
priority: p2
issue_id: "037"
tags: [code-review, chatgpt-apps, schemas, tests, widgets]
dependencies: []
---

# Tighten New Widget Apps SDK Contracts

## Problem Statement

The new visual render tools are discoverable by ChatGPT, but their Apps SDK contracts are still loose.

They advertise generic object output schemas, some visible widget actions only update local UI feedback, and tests mostly verify resource shape rather than tool behavior.

## Findings

- `app/server/travel_agent/mcp.py:202` maps all new render tools to `OBJECT_SCHEMA` instead of option/map/cart-specific schemas.
- `app/web/src/trip-components/TravelMap.tsx:170` renders `Focus route` and `Add stop` actions without bridge handlers, so ChatGPT never receives a tool call or follow-up.
- `tests/test_apps_ui_resources.py:61` covers generated HTML shape but not the new render tool payloads or model-facing resource/tool associations.
- `app/server/travel_agent/mcp.py:596` accepts `resource_uri` in `_render_trip_options_widget`, but the helper never uses it.
- Widget registration is repeated across build lists, output schemas, resources, tools, and tests, increasing drift risk.

## Proposed Solutions

### Option 1: Add Focused Contract Tests And Schemas

**Approach:** Add per-render-tool tests for output payload shape, `_meta` output templates, and expected resource registrations. Replace generic schemas with minimal specific JSON schemas for option and cart payloads. Remove unused parameters.

**Pros:**
- Directly protects the current bug surface.
- Keeps scope manageable.

**Cons:**
- Manual registration lists remain unless separately refactored.

**Effort:** Medium

**Risk:** Low

---

### Option 2: Introduce A WidgetSpec Registry

**Approach:** Define a small registry for travel widget specs and generate or validate build lists, tests, resource metadata, and render tool mappings from it.

**Pros:**
- Reduces future drift across widget registrations.

**Cons:**
- More abstraction in a PR that is already fixing runtime behavior.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

Do Option 1 before merge. Consider Option 2 after PR #29 lands or if another widget is added.

## Technical Details

**Affected files:**
- `app/server/travel_agent/mcp.py:202`
- `app/server/travel_agent/mcp.py:596`
- `app/server/travel_agent/mcp.py:614`
- `app/web/src/trip-components/TravelMap.tsx:170`
- `tests/test_apps_ui_resources.py:61`
- `tests/test_travel_agent_server.py`

**Related components:**
- Apps SDK tool descriptors
- Apps SDK bridge actions
- widget runtime/resource tests

**Database changes:** No

## Resources

- `docs/solutions/integration-issues/apps-sdk-vite-widget-asset-delivery-and-bridge-contract-20260515.md`
- `todos/032-complete-p2-restore-widget-contract-tests.md`

## Acceptance Criteria

- [x] New render tools have specific output schemas for option and cart payloads.
- [x] Server tests cover the new option/map/cart render payload behavior.
- [x] Existing resource tests cover the registered runtime templates.
- [x] Map widget action buttons bridge follow-up messages back to ChatGPT.
- [x] Unused `resource_uri` parameter was removed.

## Work Log

### 2026-05-19 - Code Review Discovery

**By:** Codex

**Actions:**
- Ran Apps SDK-focused review of PR #29.
- Compared new tests with prior bridge/resource contract lessons.

**Learnings:**
- ChatGPT can discover the new tools, but discoverability is not enough; schemas, bridge actions, and server tests must describe the actual contract.

### 2026-05-19 - Fix Implemented

**By:** Codex

**Actions:**
- Added specific output schemas for the new option-style and cart render tools.
- Added server tests for map coordinates, payload bounds, mixed currency, and public token handling.
- Wired map detail actions to `sendFollowUpMessage`.
- Removed the unused render helper URI parameter.

**Learnings:**
- The Apps SDK contract needs both server-visible schema coverage and widget-visible bridge behavior.

## Notes

This is P2 because the widgets can load, but weak contracts make model behavior and future regression detection unreliable.
