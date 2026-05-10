---
status: complete
priority: p2
issue_id: "006"
tags: [code-review, security, performance, mcp]
dependencies: []
---

# Bound Clarification JSON Payloads

## Problem Statement

The new clarification tools parse JSON strings without byte, key-count, nesting, question-count, or answer-size limits. Oversized payloads can burn CPU and memory in the FastAPI MCP process.

## Findings

- [mcp_servers/travel_agent_server.py:410](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py:410) calls `json.loads()` directly.
- `known_fields_json`, `session_json`, and `answers_json` are all caller-controlled.
- [services/trip_clarification.py:88](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py:88) iterates arbitrary `questions` and joins arbitrary answer values into summary text.

## Proposed Solutions

### Option 1: Conservative Input Limits

**Approach:** Reject JSON strings above a small max byte length and reject objects with too many keys before deeper processing.

**Pros:** Simple DoS guard.

**Cons:** Does not fully validate semantic shape.

**Effort:** Small

**Risk:** Low

### Option 2: Full Shape and Size Validation

**Approach:** Add validation for max 5 questions, max options per question, max answer length, max list length, and allowed scalar types.

**Pros:** Handles both performance and correctness.

**Cons:** More code and tests.

**Effort:** Medium

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [mcp_servers/travel_agent_server.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py)
- [services/trip_clarification.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py)

## Resources

- PR: https://github.com/caraseli02/travel-mcp-apps/pull/21

## Acceptance Criteria

- [x] Oversized JSON strings are rejected before parsing.
- [x] Oversized answer values and arrays are rejected.
- [x] Question and option counts are bounded.
- [x] Rejection errors are model-readable and not reported as persistence failures.

## Work Log

### 2026-05-10 - Code Review Discovery

**By:** Codex / ce:review

**Actions:**
- Found by security and performance review passes.

**Learnings:**
- MCP tools need explicit input bounds even when they are not database-writing tools.
