---
status: complete
priority: p2
issue_id: "008"
tags: [code-review, agent-native, mcp, clarification]
dependencies: []
---

# Return Actionable Clarification Next Steps

## Problem Statement

`submit_trip_clarification` returns `recommended_next_action` values such as `save_hotel_request` and `save_flight_request`, but these are not callable MCP tool names. The model must infer how to translate them into existing primitives.

## Findings

- [services/trip_clarification.py:327](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py:327) returns internal action labels.
- [mcp_servers/travel_agent_server.py:150](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py:150) exposes the actual persistence primitive as `add_trip_item`.
- First-turn hotel/flight flows may not have a `trip_id`, so the next model action may need a trip draft before an item can be saved.

## Proposed Solutions

### Option 1: Add Draft Tool Arguments

**Approach:** Keep `recommended_next_action`, but add `trip_draft` and `trip_item_draft` objects with concrete fields for `create_trip` or `add_trip_item`.

**Pros:** Backward-compatible and model-readable.

**Cons:** Still leaves final tool sequencing to the model.

**Effort:** Medium

**Risk:** Low

### Option 2: Return `next_tool_calls`

**Approach:** Return a list of suggested tool calls with `name` and `arguments`.

**Pros:** Directly actionable by an agent.

**Cons:** Need to avoid over-prescribing when user intent is ambiguous.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [services/trip_clarification.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py)
- [tests/test_travel_agent_server.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/tests/test_travel_agent_server.py)
- [docs/testing_chatgpt_apps.md](/Users/vladislavcaraseli/Documents/travel-mcp-app/docs/testing_chatgpt_apps.md)

## Resources

- PR: https://github.com/caraseli02/travel-mcp-apps/pull/21

## Acceptance Criteria

- [x] Submit output maps clearly to existing MCP tools.
- [x] Hotel and flight clarification returns draft data the model can save via existing primitives.
- [x] Tests assert the model-actionable next-step fields.

## Work Log

### 2026-05-10 - Code Review Discovery

**By:** Codex / ce:review

**Actions:**
- Found during agent-native review.

**Learnings:**
- Agent-native outputs should name executable primitives or include concrete draft arguments.
