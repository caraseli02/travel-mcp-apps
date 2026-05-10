---
status: complete
priority: p2
issue_id: "003"
tags: [code-review, mcp, clarification, quality]
dependencies: []
---

# Preserve Known Clarification Fields

## Problem Statement

`build_clarification_session()` can drop model-provided `known_fields` when no persisted trip is supplied. That makes the clarification flow ask questions the model already answered.

## Findings

- [services/trip_clarification.py:64](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py:64) merges `known_fields` first, then overwrites keys like `destination`, `start_date`, `end_date`, `has_hotel`, and `has_transport` with `None` values from missing trip/items context.
- Example: `known_fields={"start_date": "2026-06-01"}` is compacted away after `"start_date": None` is applied, so the trip flow still asks the duration/date question.

## Proposed Solutions

### Option 1: Compact Derived Fields Before Merge

**Approach:** Build a `derived_fields` dict, compact it, then merge `{**known_fields, **derived_fields}`.

**Pros:** Small fix; preserves intended override behavior when real trip state exists.

**Cons:** Still allows arbitrary `known_fields` keys unless paired with schema validation.

**Effort:** Small

**Risk:** Low

### Option 2: Explicit Field Resolution

**Approach:** Resolve each supported known field with clear precedence rules.

**Pros:** More explicit and easier to test.

**Cons:** More verbose.

**Effort:** Medium

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [services/trip_clarification.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py)
- [tests/test_travel_agent_server.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/tests/test_travel_agent_server.py)

## Resources

- PR: https://github.com/caraseli02/travel-mcp-apps/pull/21

## Acceptance Criteria

- [x] Model-provided `start_date`, `end_date`, and `destination` survive when no trip is supplied.
- [x] Existing trip state still overrides or fills missing model fields as intended.
- [x] Regression tests cover known fields without a `trip_id`.

## Work Log

### 2026-05-10 - Code Review Discovery

**By:** Codex / ce:review

**Actions:**
- Found during Python reviewer pass on PR #21.

**Learnings:**
- Compacting after a broad dict merge can erase valid caller-provided context.
