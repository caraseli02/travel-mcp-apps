---
status: complete
priority: p2
issue_id: "005"
tags: [code-review, security, mcp, clarification]
dependencies: []
---

# Validate Clarification Session Submit

## Problem Statement

`submit_trip_clarification` trusts caller-supplied session/question structure. Because the tool is exposed over MCP, a caller can fabricate `questions`, `required`, `intent`, and ids and receive a trusted summary or recommended action for a session the server never generated.

## Findings

- [mcp_servers/travel_agent_server.py:571](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py:571) accepts `session_json` and `answers_json` from the caller.
- [services/trip_clarification.py:88](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py:88) treats submitted `questions` as authoritative.
- Known Pattern: [docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md](/Users/vladislavcaraseli/Documents/travel-mcp-app/docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md) explicitly warns not to trust client-controlled widget payloads.

## Proposed Solutions

### Option 1: Validate Against Allowed Session Shape

**Approach:** Add strict validation for intent, question ids, answer types, options, and max question count before summarizing.

**Pros:** Smallest change while keeping current stateless submit design.

**Cons:** Still trusts a stateless payload after validation.

**Effort:** Medium

**Risk:** Medium

### Option 2: Recompute Session From Trusted Inputs

**Approach:** Submit only trusted fields (`utterance`, `intent`, `destination`, `trip_id`, `known_fields_json`, answers), rebuild the server-side question set, then summarize.

**Pros:** Better trust boundary; session structure is server-generated.

**Cons:** Requires changing widget submit payload and tests.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [mcp_servers/travel_agent_server.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/travel_agent_server.py)
- [services/trip_clarification.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/services/trip_clarification.py)
- [mcp_servers/widgets/trip_clarification_v1.html](/Users/vladislavcaraseli/Documents/travel-mcp-app/mcp_servers/widgets/trip_clarification_v1.html)
- [tests/test_travel_agent_server.py](/Users/vladislavcaraseli/Documents/travel-mcp-app/tests/test_travel_agent_server.py)

## Resources

- PR: https://github.com/caraseli02/travel-mcp-apps/pull/21

## Acceptance Criteria

- [x] Unknown question ids are rejected or ignored safely.
- [x] Invalid option values and wrong answer types are rejected.
- [x] Fabricated session structures cannot create trusted recommendations.
- [x] Tests cover malformed JSON, wrong shape, unknown ids, invalid options, and wrong answer types.

## Work Log

### 2026-05-10 - Code Review Discovery

**By:** Codex / ce:review

**Actions:**
- Found by security and agent-native review passes.

**Learnings:**
- Widget-originated payloads are still client input and need server-side validation.
