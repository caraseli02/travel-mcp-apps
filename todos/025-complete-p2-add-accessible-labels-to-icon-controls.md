---
status: complete
priority: p2
issue_id: "025"
tags: [code-review, accessibility, agent-native, frontend]
dependencies: []
---

# Add Accessible Labels to Icon Controls

Several interactive controls are icon-only or marker-only, which makes them harder for screen readers, automated accessibility tooling, and agent-native interaction to identify.

## Problem Statement

The transformed travel components rely on compact controls. Icon-only buttons need accessible names so users and agentic automation can understand the action without relying on visual context.

## Findings

- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:398) renders previous carousel control with only a `ChevronLeft` icon.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:407) renders next carousel control with only a `ChevronRight` icon.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:832) renders cart decrement with only a `Minus` icon.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:851) renders cart increment with only a `Plus` icon.
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:691) renders fallback map marker buttons with single-letter visual labels.

## Proposed Solutions

### Option 1: Add `aria-label` to Icon Buttons and Markers

**Approach:** Add concise labels such as `Previous option`, `Next option`, `Decrease Hotel V Nesplein quantity`, `Increase Hotel V Nesplein quantity`, and `Select Hotel V Nesplein on map`.

**Pros:**
- Small targeted fix.
- Improves accessibility and agent-native inspectability.
- No visual design change.

**Cons:**
- Labels must be maintained if button behavior changes.

**Effort:** 30-60 minutes

**Risk:** Low

---

### Option 2: Use Visible Text for Compact Controls Where Space Allows

**Approach:** Replace some icon-only controls with text or icon-plus-text controls.

**Pros:**
- Improves clarity for all users.
- Less reliance on assistive-only text.

**Cons:**
- More visual change.
- Could add clutter in compact layouts.

**Effort:** 1-2 hours

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [TravelPizzazComponents.tsx](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/src/trip-components/TravelPizzazComponents.tsx:398)

Related components:
- `TravelComparisonCarousel`
- `TravelCart`
- `FallbackTravelMap`

Database changes: No

## Resources

- Review target: current branch `codex/feat-pizzaz-storybook-gallery`
- Storybook includes `@storybook/addon-a11y`, but current checks do not fail the build on missing accessible names.

## Acceptance Criteria

- [x] Every icon-only button has a meaningful accessible name.
- [x] Fallback map marker buttons have place-specific accessible names.
- [x] Browser smoke reports no unlabeled icon-only buttons in affected stories.
- [x] `npm run check` passes.

## Work Log

### 2026-05-14 - Code Review Discovery

**By:** Codex

**Actions:**
- Reviewed new trip component controls from an agent-native and accessibility perspective.
- Identified icon-only and marker-only buttons without explicit accessible names.

**Learnings:**
- The visual polish work needs a matching pass for non-visual interaction semantics.

### 2026-05-14 - Completed

**By:** Codex

**Actions:**
- Added accessible labels to carousel previous/next controls.
- Added item-specific accessible labels to cart quantity controls.
- Added place-specific accessible labels to fallback map markers.
- Browser smoke verified zero unlabeled icon-only controls in affected stories.

**Learnings:**
- Automated button-name checks are a useful lightweight companion to visual Storybook review.
