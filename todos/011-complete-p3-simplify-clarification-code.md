---
status: complete
priority: p3
issue_id: "011"
tags: [code-review, simplicity, clarification, storybook]
dependencies: []
---

# Simplify Clarification Code

## Problem Statement

The clarification implementation has a few small simplicity issues that do not block merge but make future maintenance noisier.

## Findings

- [services/trip_clarification.py:283](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py:283) calls `replace(session, questions=session.questions)` before `asdict()`, which is a no-op.
- [services/trip_clarification.py:11](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py:11) includes `save_constraints` in `NextAction`, but `next_action()` never returns it.
- [mcp_servers/widgets/stories/fixtures/travelFixtures.ts](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/widgets/stories/fixtures/travelFixtures.ts) repeats full clarification question/option shapes inline for each scenario.

## Proposed Solutions

### Option 1: Small Cleanup Pass

**Approach:** Replace `session_to_dict()` with `return asdict(session)`, remove the unused literal, and add tiny fixture helpers.

**Pros:** Simple, lower maintenance.

**Cons:** Low user-visible impact.

**Effort:** Small

**Risk:** Low

### Option 2: Leave Until Next Widget Change

**Approach:** Defer until clarification questions change again.

**Pros:** Avoids churn during PR stabilization.

**Cons:** Keeps unnecessary noise in new code.

**Effort:** None now

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [services/trip_clarification.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py)
- [mcp_servers/widgets/stories/fixtures/travelFixtures.ts](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/widgets/stories/fixtures/travelFixtures.ts)

## Resources

- PR: https://github.com/caraseli02/travel-mcp-apps/pull/21

## Acceptance Criteria

- [x] No-op `replace()` import and call are removed.
- [x] `NextAction` only lists values that can be returned or intentionally supported.
- [x] Clarification fixtures use small helpers or otherwise reduce repeated option boilerplate.

## Work Log

### 2026-05-10 - Code Review Discovery

**By:** Codex / ce:review

**Actions:**
- Found during code simplicity review.

**Learnings:**
- New feature code is easiest to clean while context is fresh.
