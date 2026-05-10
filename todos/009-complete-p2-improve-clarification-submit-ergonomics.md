---
status: complete
priority: p2
issue_id: "009"
tags: [code-review, agent-native, mcp, schema]
dependencies: []
---

# Improve Clarification Submit Ergonomics

## Problem Statement

`submit_trip_clarification` requires `session_json` and `answers_json` as stringified JSON. The widget can serialize this, but model callers must copy and escape nested data, which increases malformed tool calls and weakens agent-native parity.

## Findings

- [mcp_servers/travel_agent_server.py:571](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py:571) exposes stringified JSON inputs.
- [mcp_servers/widgets/trip_clarification_v1.html:59](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/widgets/trip_clarification_v1.html:59) serializes the nested payload for UI-originated submit.
- Agent-native review flagged that direct model/tool usage is less ergonomic than the UI path.

## Proposed Solutions

### Option 1: Structured FastMCP Parameters

**Approach:** If FastMCP supports structured dict parameters reliably, expose `session` and `answers` as objects instead of strings.

**Pros:** Best model ergonomics.

**Cons:** Must verify schema compatibility with ChatGPT Apps and current Inspector constraints.

**Effort:** Medium

**Risk:** Medium

### Option 2: Split Primitive Fields

**Approach:** Expose scalar fields such as `session_id`, `intent`, `destination`, and `answers_json`.

**Pros:** Easier for models than copying full session JSON.

**Cons:** Still needs answer shape validation.

**Effort:** Medium

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [mcp_servers/travel_agent_server.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py)
- [mcp_servers/widgets/trip_clarification_v1.html](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/widgets/trip_clarification_v1.html)
- [tests/test_api.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/tests/test_api.py)

## Resources

- PR: https://github.com/caraseli02/travel-mcp-apps/pull/21

## Acceptance Criteria

- [x] Submit schema is practical for both widget and direct model callers.
- [x] ChatGPT Apps schema compatibility remains covered by tests.
- [x] Malformed direct model calls return clear validation errors.

## Work Log

### 2026-05-10 - Code Review Discovery

**By:** Codex / ce:review

**Actions:**
- Found during agent-native review.

**Learnings:**
- Widget-friendly serialization is not necessarily model-friendly tool design.
