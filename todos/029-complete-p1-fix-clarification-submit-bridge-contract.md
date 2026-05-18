---
status: complete
priority: p1
issue_id: "029"
tags: [code-review, chatgpt-apps, widgets, integration, trip-clarification]
dependencies: []
---

# Fix Clarification Submit Bridge Contract

## Problem Statement

The React clarification widget calls `submit_trip_clarification` with `session_id` and `answers_json`, but the server tool expects either `session_json` plus `answers_json`, or direct model-caller fields such as `utterance`. As written, widget submission will call the tool without a usable session and hit the server's validation path requiring `utterance`.

This breaks the primary interactive clarification workflow.

## Findings

- `app/web/src/trip-components/TripClarification.tsx:54` calls `callTool("submit_trip_clarification", { session_id, answers_json })`.
- `app/server/travel_agent/mcp.py:716` defines `submit_trip_clarification(answers_json, session_json="", utterance=None, ...)`.
- `app/server/travel_agent/mcp.py:726` only parses a session when `session_json.strip()` is present; otherwise it requires `utterance`.
- The previous documented widget contract expected `session_json: JSON.stringify(session)` and `answers_json: JSON.stringify(answers)`.
- The new `useCallTool` helper does not request host close after successful submit, does not send a follow-up message with the returned recommendation, and has no JSON-RPC `tools/call` fallback.

Known Pattern: `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md` and `docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md` document this exact class of Apps SDK contract failure.

## Proposed Solutions

### Option 1: Restore the Existing Server Contract in the Widget

**Approach:** Pass `session_json: JSON.stringify(clarification)` and `answers_json: JSON.stringify(answers)`, process the result, send an appropriate follow-up message, and call `window.openai.requestClose()` when available after success.

**Pros:**
- Aligns with existing server tests and documented behavior.
- Smallest server-side blast radius.
- Keeps direct model-caller fallback behavior unchanged.

**Cons:**
- The widget must retain enough session data to submit safely.
- Requires typed bridge result handling in React.

**Effort:** Small to Medium

**Risk:** Low

---

### Option 2: Add a Server-Side `session_id` Submit Mode

**Approach:** Teach `submit_trip_clarification` to retrieve or reconstruct sessions by `session_id`.

**Pros:**
- Keeps widget payload smaller.
- Could support durable session storage later.

**Cons:**
- Current code does not appear to persist clarification sessions by ID.
- More backend complexity for a transient widget flow.

**Effort:** Medium

**Risk:** Medium

---

### Option 3: Split Widget Submit Into a Dedicated Tool

**Approach:** Add a widget-only submit tool with an explicit schema matching the React component's payload.

**Pros:**
- Makes the bridge contract explicit.
- Could simplify model-facing tool semantics.

**Cons:**
- Adds another tool to the model surface.
- Duplicates validation unless carefully factored.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `app/web/src/trip-components/TripClarification.tsx:50` - submit transition and tool args
- `app/web/src/bridge/useCallTool.ts:6` - bridge helper behavior
- `app/server/travel_agent/mcp.py:716` - submit tool signature and validation
- `tests/test_apps_ui_resources.py` - removed regression assertions for submit bridge markers

**Related components:**
- Trip clarification widget lifecycle
- ChatGPT Apps bridge
- MCP tool result close metadata

**Database changes:** No

## Resources

- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md`
- `docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md`

## Acceptance Criteria

- [ ] Submitting answers from the widget calls `submit_trip_clarification` with a payload accepted by the server.
- [ ] Successful submit closes or collapses the widget through the Apps lifecycle contract.
- [ ] The widget surfaces bridge/tool errors and allows retry without losing answers.
- [ ] Regression tests assert the widget submit payload includes `session_json`, `answers_json`, close behavior, and follow-up behavior.
- [ ] Existing server tests for invalid submit payloads still pass.

## Work Log

### 2026-05-15 - Code Review Discovery

**By:** Claude Code

**Actions:**
- Compared React submit call args with `submit_trip_clarification` server signature.
- Reviewed prior solution docs for Apps SDK clarification widget lifecycle and schema contract.
- Ran Python tests, which passed but do not exercise the new React widget submit path.

**Learnings:**
- The server-side submit contract is still protected, but the new React widget no longer follows it.

### 2026-05-15 - Fix Implemented

**By:** Claude Code

**Actions:**
- Updated `TripClarification` to call `submit_trip_clarification` with `session_json` and `answers_json`.
- Added bridge fallbacks for `tools/call` and `ui/message` in `useCallTool`.
- Added `requestClose` support after successful submit.
- Added tests that assert the built clarification resource includes submit, close, follow-up, and fallback bridge markers.

**Learnings:**
- The widget bridge helper needs to preserve the documented MCP Apps bridge path, not only the ChatGPT convenience APIs.

## Notes

This blocks merge because it breaks a user-visible primary flow: answering clarification questions from the hosted widget.
