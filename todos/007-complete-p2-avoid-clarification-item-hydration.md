---
status: complete
priority: p2
issue_id: "007"
tags: [code-review, performance, mcp, postgres]
dependencies: []
---

# Avoid Clarification Item Hydration

## Problem Statement

Preparing clarification for an existing trip loads every trip item just to determine whether the trip already has hotel or transport context.

## Findings

- [mcp_servers/travel_agent_server.py:437](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py:437) calls `store.list_items(trip_id)`.
- [services/trip_clarification.py:70](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py:70) only needs `has_hotel` and `has_transport`.
- `PostgresTripStore.list_items()` materializes all rows into `TripItem` objects, making a lightweight prompt O(n) in trip item count.

## Proposed Solutions

### Option 1: Store-Level Item Type Flags

**Approach:** Add a store helper that returns item-type presence or counts for a trip.

**Pros:** Efficient and reusable.

**Cons:** Requires updates to all store implementations.

**Effort:** Medium

**Risk:** Low

### Option 2: Accept Known Fields From Model

**Approach:** For the MVP, avoid loading items and rely on model-provided `known_fields_json` unless item context is explicitly needed.

**Pros:** Minimal code.

**Cons:** Less accurate when `trip_id` has useful persisted context.

**Effort:** Small

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [mcp_servers/travel_agent_server.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py)
- [services/trips.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trips.py)
- [services/trip_clarification.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py)

## Resources

- PR: https://github.com/caraseli02/travel-mcp-apps/pull/21

## Acceptance Criteria

- [x] Clarification preparation does not hydrate all trip items for simple type-presence checks.
- [x] In-memory, file, and Postgres stores expose equivalent behavior.
- [x] Tests cover existing trip context without depending on full item hydration.

## Work Log

### 2026-05-10 - Code Review Discovery

**By:** Codex / ce:review

**Actions:**
- Found during performance review.

**Learnings:**
- Prompt-preparation paths should stay cheap because they can run before every user-visible widget render.
