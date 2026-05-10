---
status: complete
priority: p2
issue_id: "004"
tags: [code-review, mcp, clarification, quality]
dependencies: []
---

# Tighten Destination Inference

## Problem Statement

`infer_destination()` greedily captures trailing clauses, which can produce incorrect destinations in widget copy and model-visible summaries.

## Findings

- [services/trip_clarification.py:300](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py:300) matches up to 60 characters after `to`, `in`, or `for`.
- Example: `"I want to book hotel in Paris for June"` can infer `"Paris for June"` instead of `"Paris"`.

## Proposed Solutions

### Option 1: Stop at Common Delimiters

**Approach:** Stop capture at common travel clauses such as `for`, `from`, `on`, `with`, `between`, and punctuation.

**Pros:** Simple and handles likely prompt shapes.

**Cons:** Still heuristic.

**Effort:** Small

**Risk:** Low

### Option 2: Prefer Explicit Destination Field

**Approach:** Keep inference minimal and rely on ChatGPT passing `destination` when possible.

**Pros:** Reduces false confidence from parsing.

**Cons:** More dependent on model tool arguments.

**Effort:** Small

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

- [x] `"I want to book hotel in Paris for June"` infers `Paris`.
- [x] `"I want to book fly to Tokyo from Barcelona"` infers `Tokyo`.
- [x] Existing simple prompts like `"I want to plan a trip to Venice"` still infer correctly.

## Work Log

### 2026-05-10 - Code Review Discovery

**By:** Codex / ce:review

**Actions:**
- Found during Python reviewer pass on PR #21.

**Learnings:**
- Destination inference affects both UI copy and agent-visible structured content.
