---
title: "Harden Python MCP trip clarification flow after TypeScript backport"
module: "Travel MCP ChatGPT Apps"
date: 2026-05-10
problem_type: integration_issue
component: trip_clarification
severity: high
status: resolved
root_cause: client_controlled_mcp_payload_contract_gap
resolution_type: code_fix
commit: 0749649bbb1af1ffd6584049ecec5c83af374423
tags:
  - python
  - fastmcp
  - mcp
  - chatgpt-apps
  - trip-clarification
  - validation
  - storybook
  - agent-native
related_files:
  - mcp_servers/travel_agent_server.py
  - services/trip_clarification.py
  - services/trips.py
  - tests/test_travel_agent_server.py
  - tests/test_trip_store.py
---

# Troubleshooting: Python MCP Trip Clarification Hardening

## Problem

The trip clarification widget was backported from a TypeScript migration branch into the Python FastAPI/FastMCP app so the main project could keep its existing deployment path. The feature worked, but review found that the Python MCP boundary still treated widget and model input as trusted data.

The risky areas were concentrated in `submit_trip_clarification` and session preparation:

- caller-provided `session_json` could fabricate or mutate generated questions
- malformed payloads could become generic persistence failures instead of validation errors
- JSON payloads had no size or depth bounds
- known fields could be dropped when no persisted trip was supplied
- destination inference could capture too much text
- existing-trip clarification loaded every saved trip item when it only needed item type presence
- submit output returned internal labels rather than actionable tool-call drafts
- direct model callers had to copy and escape a full widget session to submit answers

## Root Cause

The TypeScript implementation had been moved into a separate project, and the Python backport kept the visible widget behavior but did not fully carry over the trust-boundary rules needed for a production MCP tool. `submit_trip_clarification` accepted client-controlled JSON, summarized it as if it came from the server-generated session, and relied on broad exception handling to turn unexpected failures into tool errors.

There was also a data-shape mismatch in session preparation. `build_clarification_session()` merged model-provided `known_fields` with derived trip state before compacting empty values, so `None` values from missing trip context could erase useful caller context. Existing-trip clarification also passed full `TripItem` objects to question generation, making a lightweight prompt scale with trip item count.

## Solution

### Preserve known fields before deriving trip state

The fix separates derived fields from caller-provided fields, compacts the derived record first, then merges it over the caller context. This preserves useful model context when no trip exists while still allowing real persisted trip state to fill or override fields.

```python
derived_fields = compact_record(
    {
        "destination": resolved_destination,
        "trip_id": trip.id if trip else None,
        "start_date": trip.start_date if trip else None,
        "end_date": trip.end_date if trip else None,
        "has_hotel": has_item_type(item_type_counts, {"hotel"}) or None,
        "has_transport": has_item_type(item_type_counts, {"flight", "transport"}) or None,
    }
)
resolved_known_fields = compact_record(
    {
        **(known_fields or {}),
        **derived_fields,
    }
)
```

Destination inference was narrowed with a stopping lookahead so prompts such as "I want to book hotel in Paris for June" infer `Paris`, not the full trailing phrase.

### Validate generated sessions on submit

`summarize_clarification()` now validates the session shape, answer shape, generated-question integrity, answer ids, and answer values before summarizing anything.

```python
validate_session(session)
validate_answers(answers)
validate_session_matches_generated_questions(session)

questions = session.get("questions")
question_ids = {question["id"] for question in questions}
if any(question_id not in question_ids for question_id in answers):
    raise TripValidationError("answers_json includes answers for unknown questions.")
```

The important part is `validate_session_matches_generated_questions()`: it regenerates the expected questions from the submitted intent and known fields, then rejects tampered question payloads.

```python
expected = [asdict(question) for question in questions_for(intent, known_fields)[:MAX_QUESTIONS]]
actual = session.get("questions")
if actual != expected:
    raise TripValidationError("session_json questions do not match the generated clarification session.")
```

### Bound JSON payloads at the MCP boundary

The server now rejects oversized, overly broad, or deeply nested JSON before it reaches domain summarization.

```python
MAX_JSON_PAYLOAD_CHARS = 12_000
MAX_JSON_OBJECT_KEYS = 64
MAX_JSON_DEPTH = 8

def _parse_json_object(value: str, field_name: str) -> dict[str, Any]:
    if len(value or "") > MAX_JSON_PAYLOAD_CHARS:
        raise TripValidationError(
            f"{field_name} may be at most {MAX_JSON_PAYLOAD_CHARS} characters."
        )
    parsed = json.loads(value or "{}")
    if not isinstance(parsed, dict):
        raise TripValidationError(f"{field_name} must be a JSON object.")
    _validate_json_shape(parsed, field_name)
    return parsed
```

Because these failures raise `TripValidationError`, the MCP response is a clear tool validation error instead of `Trip persistence failed: ...`.

### Use aggregate item counts for clarification context

Question generation only needs to know whether the trip already has hotel or transport items. The store layer now exposes `item_type_counts()` for Postgres, in-memory, and file-backed stores.

```python
def item_type_counts(self, trip_id: str) -> dict[str, int]:
    self.get_trip(trip_id)
    with self._pool.connection() as conn:
        rows = conn.execute(
            """
            SELECT item_type, COUNT(*) AS count
            FROM trip_items
            WHERE trip_id = %s
            GROUP BY item_type
            """,
            (trip_id,),
        ).fetchall()
    return {str(row["item_type"]): int(row["count"]) for row in rows}
```

The MCP server now passes these counts into `build_clarification_session()` rather than materializing all items.

### Return actionable next steps

Submit results now include both a human summary and structured drafts the model can act on:

- `trip_draft`
- `trip_item_draft`
- `next_tool_calls`

For example, after hotel clarification with no existing trip, the result recommends creating a trip first and includes the `create_trip` arguments. With an existing `trip_id`, it can recommend `add_trip_item` with a hotel or flight request draft.

### Improve direct model-call ergonomics

The widget can still submit full `session_json`, but direct model callers can now omit it and pass normal tool inputs:

```python
def submit_trip_clarification(
    answers_json: str,
    session_json: str = "",
    utterance: str | None = None,
    intent: str | None = None,
    destination: str | None = None,
    trip_id: str | None = None,
    known_fields_json: str = "{}",
) -> CallToolResult:
```

When `session_json` is absent, the server rebuilds the clarification session from `utterance`, `intent`, `destination`, `trip_id`, and `known_fields_json`, then validates answers against that generated session.

## Regression Tests

The fix added targeted tests for each review finding:

- known fields survive without a `trip_id`
- destination inference stops at travel/date clauses
- existing-trip clarification uses aggregate item counts rather than `list_items()`
- malformed `session_json` returns a validation error
- tampered session questions are rejected
- answers for unknown question ids are rejected
- oversized JSON is rejected
- direct submit without `session_json` works
- submit output includes actionable drafts and `next_tool_calls`
- `item_type_counts()` works in the store layer

The aggregate test deliberately monkeypatches `list_items()` to raise, proving clarification preparation no longer hydrates full item rows.

## Verification

Run the Python suite:

```bash
python -m pytest
```

Verified result:

```text
63 passed, 1 skipped
```

Run widget checks:

```bash
cd mcp_servers/widgets
npm run check
```

Verified result:

```text
tsc --noEmit passed
storybook build completed successfully
```

Also run whitespace validation before commit:

```bash
git diff --cached --check
```

## Prevention

Treat MCP widget payloads as untrusted input, even when they originate from a first-party widget. Regenerate or otherwise authenticate server-derived session state before using it to make recommendations.

For future MCP tools that accept JSON strings:

- enforce payload size limits before parsing
- validate object/list width and nesting depth after parsing
- return domain validation errors, not generic persistence errors
- test malformed JSON, wrong top-level type, unknown ids, tampered generated fields, and oversized payloads

For clarification-style tools:

- keep question generation deterministic from `intent` and `known_fields`
- validate submitted questions against regenerated questions
- preserve model-provided known fields unless persisted state intentionally overrides them
- expose aggregate store APIs when a prompt only needs counts or type presence
- return next tool-call drafts rather than internal action labels only
- support direct model calls without requiring the model to copy a full widget session blob

## Related Documentation

- `docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md` documents the earlier widget routing and close-lifecycle fix. That doc said stricter submit validation was still pending; this solution resolves that gap for the Python backport.
- `docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md` covers the broader tool/render contract for the travel-agent MCP surface.
- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md` covers the Storybook check workflow that remains useful for widget regressions.

## Refresh Candidate

The high-confidence stale reference is `docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md`: its prevention section still says `submit_trip_clarification` needs stricter validation. That can now be refreshed narrowly to point at this Python hardening solution.
