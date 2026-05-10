---
status: complete
priority: p3
issue_id: "010"
tags: [code-review, mcp, errors, quality]
dependencies: []
---

# Classify Clarification Validation Errors

## Problem Statement

Some malformed clarification submit payloads are reported as `"Trip persistence failed"` even though the failure is input validation, not persistence.

## Findings

- [services/trip_clarification.py:90](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py:90) raises `ValueError`.
- [mcp_servers/travel_agent_server.py:575](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py:575) lets that bubble into the generic exception branch.
- Local review reproduced `{"questions": {}}` producing `"Trip persistence failed: session_json must include a questions array."`.

## Proposed Solutions

### Option 1: Raise Domain Validation Errors

**Approach:** Raise `TripValidationError` from clarification validation failures.

**Pros:** Reuses existing `_run_trip_tool()` handling.

**Cons:** Couples service validation to trip store exception types.

**Effort:** Small

**Risk:** Low

### Option 2: Translate in Tool Handler

**Approach:** Catch `ValueError` around `summarize_clarification()` and wrap as `TripValidationError`.

**Pros:** Keeps the service generic.

**Cons:** Tool handler owns more error mapping.

**Effort:** Small

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [services/trip_clarification.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py)
- [mcp_servers/travel_agent_server.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py)
- [tests/test_travel_agent_server.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/tests/test_travel_agent_server.py)

## Resources

- PR: https://github.com/caraseli02/travel-mcp-apps/pull/21

## Acceptance Criteria

- [x] Malformed session objects return validation errors without the persistence prefix.
- [x] Tests cover missing or invalid `questions`.

## Work Log

### 2026-05-10 - Code Review Discovery

**By:** Codex / ce:review

**Actions:**
- Found during Python reviewer pass and confirmed locally.

**Learnings:**
- Generic exception wrappers can obscure caller-actionable validation failures.
