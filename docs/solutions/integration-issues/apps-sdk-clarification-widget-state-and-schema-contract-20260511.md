---
title: "Fix ChatGPT Apps clarification widget state and MCP schema contract"
module: "Travel MCP ChatGPT Apps"
date: 2026-05-11
problem_type: integration_issue
component: trip_clarification_widget
severity: high
status: resolved
root_cause: apps_sdk_widget_state_and_tool_contract_gap
resolution_type: code_fix
last_refreshed: 2026-05-12
tags:
  - chatgpt-apps
  - apps-sdk
  - mcp
  - fastmcp
  - widgets
  - storybook
  - output-schema
  - trip-clarification
related_files:
  - app/server/travel_agent/mcp.py
  - app/web/trip_clarification_v1.html
  - app/web/src/bridge/hostHarness.ts
  - tests/test_api.py
  - tests/test_apps_ui_resources.py
related_docs:
  - docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md
  - docs/solutions/integration-issues/python-mcp-trip-clarification-hardening-20260510.md
  - docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md
  - docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md
---

# Troubleshooting: Apps SDK Clarification Widget State and Tool Contract

## Problem

Hosted ChatGPT Apps testing showed that the trip clarification widget rendered but did not behave like a working multi-step flow. Selecting an option did not reliably advance or stay on the next question, and pressing Submit did not lead to useful follow-up behavior in ChatGPT.

After the immediate widget bug was fixed, an OpenAI Apps SDK best-practices review found two additional contract gaps: `submit_trip_clarification` sounded like it saved durable state even though it only summarized answers, and tools returning `structuredContent` did not advertise `outputSchema` in the MCP tool list.

## Symptoms

- Clicking a clarification option in ChatGPT appeared inert or reset back to the original question.
- Submit was the only visible action after selection, but it did not produce a useful state change in the conversation.
- Storybook could build while the hosted widget still failed because local preview did not fully exercise ChatGPT host replays and bridge behavior.
- Browser inspection of the Storybook iframe found a JavaScript syntax error after the first attempted state fix: mixing `??` with `||` without parentheses.
- MCP `list_tools` returned `outputSchema: null` for travel-agent tools that return `structuredContent`.

## Root Cause

There were three overlapping contract gaps.

First, the widget kept the selected question index and answers only in local JavaScript variables. ChatGPT can replay the original tool output through the Apps bridge, so the widget could be repainted from the initial `toolOutput` and lose user interaction state. For Apps SDK widgets, meaningful local UI state must be persisted through `window.openai.widgetState` and `window.openai.setWidgetState`.

Second, the submit bridge path depended mainly on ChatGPT helper methods. The widget used `window.openai.callTool` and `sendFollowUpMessage`, but it did not have a generic JSON-RPC `tools/call` fallback. This made the component less portable across MCP Apps hosts and harder to reason about as a plain Apps bridge integration.

Third, the Python FastMCP tools returned `CallToolResult` directly so they could control Apps metadata. In the installed FastMCP version, `outputSchema` is derived from return annotations; direct `CallToolResult` handlers therefore listed no output schema even though the tools returned structured data. The submit tool also used "Saving" copy and mutation annotations despite only summarizing answers and recommending the next tool call.

## Solution

### Persist widget interaction state

The clarification widget now restores and persists `session_id`, current question index, answers, and submit state through the Apps widget state API.

```js
function currentWidgetState(){return window.openai?.widgetState||{}}

function restoreWidgetState(output){
  const saved=currentWidgetState();
  if(saved.session_id!==output.session_id)return null;
  return{
    index:typeof saved.index==="number"?saved.index:output.current_index||0,
    answers:saved.answers&&typeof saved.answers==="object"?saved.answers:output.answers||{},
    submitState:saved.submitState||"idle"
  }
}

function persistWidgetState(){
  if(!state.session||!window.openai?.setWidgetState)return;
  const nextState={
    session_id:state.session.session_id,
    index:state.index,
    answers:state.answers,
    submitState:state.submitState
  };
  window.openai.setWidgetState(nextState).catch(()=>{})
}
```

Every user-visible transition now calls `persistWidgetState()` after repainting: option selection, skip, previous/next navigation, and submit state changes. Last-question selection no longer auto-submits; it records the answer and leaves Submit as the explicit action.

### Use bridge-compatible submit and follow-up paths

The widget still uses ChatGPT's convenience helper when available, but it now falls back to JSON-RPC `tools/call` for tool execution and `ui/message` for follow-up messaging.

```js
function postRpc(method,params,timeout=8000){
  return new Promise((resolve,reject)=>{
    const id="trip-clarification-"+Date.now()+"-"+Math.random().toString(16).slice(2);
    const timer=setTimeout(()=>{
      window.removeEventListener("message",onMessage);
      reject(new Error(method+" timed out"))
    },timeout);

    function onMessage(event){
      const message=typeof event.data==="string"?safeJson(event.data):event.data;
      if(!message||message.id!==id)return;
      window.clearTimeout(timer);
      window.removeEventListener("message",onMessage);
      if(message.error)reject(new Error(message.error.message||"Bridge request failed"));
      else resolve(message.result)
    }

    window.addEventListener("message",onMessage);
    window.parent?.postMessage({jsonrpc:"2.0",id,method,params},"*")
  })
}

async function callTool(name,args){
  if(window.openai?.callTool)return window.openai.callTool(name,args);
  return postRpc("tools/call",{name,arguments:args})
}
```

Follow-up messaging uses the current ChatGPT helper shape when present:

```js
await window.openai.sendFollowUpMessage({prompt:text});
```

and falls back to:

```js
window.parent?.postMessage({
  jsonrpc:"2.0",
  method:"ui/message",
  params:{role:"user",content:[{type:"text",text}]}
},"*")
```

The UI text was also changed from `Saving` / `Saved` to `Submitting` / `Submitted`, because the submit tool is not the durable persistence operation.

### Correct submit tool semantics

`submit_trip_clarification` now describes its actual behavior: it summarizes answers, returns drafts and recommended next calls, and does not persist a trip or trip item by itself.

```python
@server.tool(
    name="submit_trip_clarification",
    title="Summarize trip clarification answers",
    description=(
        "Use this after the user answers trip clarification questions. It summarizes "
        "selected answers and recommends whether to create a trip, save hotel "
        "constraints, save flight constraints, or ask a text follow-up. Widgets can "
        "submit session_json. Direct model callers can omit session_json and pass "
        "utterance, intent, destination, trip_id, and known_fields_json instead. "
        "This tool does not persist a trip or trip item by itself; after it returns, "
        "continue with the recommended next tool call when appropriate."
    ),
    annotations=READ_ONLY,
    meta=_status_meta("Summarizing trip answers", "Summarized trip answers"),
)
```

This prevents the model and reviewers from assuming that answer submission has already saved application state.

### Attach output schemas for direct `CallToolResult` handlers

FastMCP derives output schemas from typed return values. Because this app returns `CallToolResult` directly to control Apps SDK metadata, the tool registry needs explicit schemas attached to the `output_schema` cached property used by `list_tools`.

```python
TOOL_OUTPUT_SCHEMAS: dict[str, dict[str, Any]] = {
    "create_trip": _output_schema({"trip": TRIP_SCHEMA}),
    "add_trip_item": _output_schema(
        {
            "trip": TRIP_SCHEMA,
            "item": TRIP_ITEM_SCHEMA,
            "items": {"type": "array", "items": TRIP_ITEM_SCHEMA},
            "deduped": {"type": "boolean"},
        }
    ),
    "submit_trip_clarification": _output_schema(
        {
            "session": OBJECT_SCHEMA,
            "resolved_fields": OBJECT_SCHEMA,
            "remaining_fields": {"type": "array", "items": {"type": "string"}},
            "recommended_next_action": {"type": "string"},
            "trip_draft": OBJECT_SCHEMA,
            "trip_item_draft": OBJECT_SCHEMA,
            "next_tool_calls": {"type": "array", "items": OBJECT_SCHEMA},
            "summary": {"type": "string"},
        }
    ),
}
```

Each output schema is wrapped with the standard tool error shape because `_run_trip_tool()` returns `structuredContent={"error": ...}` for validation and store failures.

```python
def _register_output_schemas() -> None:
    for tool in server._tool_manager.list_tools():
        schema = TOOL_OUTPUT_SCHEMAS.get(tool.name)
        if schema is not None:
            tool.__dict__["output_schema"] = {"anyOf": [schema, ERROR_OUTPUT_SCHEMA]}
```

This is deliberately localized to the FastMCP registry boundary. The tool functions still return `CallToolResult`, so existing Apps metadata, `_meta`, and widget resource behavior remain unchanged.

## Regression Coverage

The API test for mounted MCP servers now verifies that relevant travel-agent tools expose non-null `outputSchema` through `list_tools`.

```python
assert tools["get_trip_board"].outputSchema is not None
assert tools["render_trip_board"].outputSchema is not None
assert tools["submit_trip_clarification"].outputSchema is not None
```

It also verifies the corrected submit semantics:

```python
assert tools["submit_trip_clarification"].title == "Summarize trip clarification answers"
assert tools["submit_trip_clarification"].annotations.readOnlyHint is True
```

The widget resource test now asserts that the clarification HTML includes the state and bridge primitives the flow depends on:

```python
assert "setWidgetState" in html
assert "ui/message" in html
assert "tools/call" in html
assert "{prompt:text}" in html
```

Finally, a Playwright Storybook smoke test was run manually against `Widgets/Trip Clarification`. It verified that selecting the first option advances from question 1 to question 2, persists `widgetState`, submits, closes, and logs no console errors.

## Verification

Run the packaged Python suite:

```bash
source .venv/bin/activate
python -m pytest tests
```

Verified result:

```text
63 passed, 1 skipped
```

Run widget checks:

```bash
cd app/web
npm run check
```

Verified result:

```text
tsc --noEmit passed
storybook build completed successfully
```

Run the Storybook interaction smoke test with Playwright after starting Storybook:

```bash
cd app/web
npm run storybook -- --ci
```

The smoke test result showed:

```json
{
  "firstPrompt": "How long are you planning to stay in Venice?",
  "secondPrompt": "What's your main travel style?",
  "count": "2 of 3",
  "selectedPersisted": {
    "session_id": "clarify-plan-trip-venice",
    "index": 1,
    "answers": {
      "duration": "1-2 days"
    },
    "submitState": "idle"
  },
  "closed": "Questions dismissed.",
  "errors": []
}
```

## Prevention

For ChatGPT Apps widgets, treat host bridge replays as normal behavior. Any meaningful UI state that must survive a host update belongs in `window.openai.widgetState`, not only in local component variables.

For widget-initiated actions, prefer a bridge helper that can use ChatGPT convenience methods and generic MCP Apps JSON-RPC. The helper should feature-detect capabilities and keep error states visible to the user.

For MCP tools that return `structuredContent`, ensure `outputSchema` is visible in `list_tools`. If the framework cannot derive it because handlers return `CallToolResult`, attach the schema at the tool registry boundary and cover it with MCP integration tests.

Keep tool names, titles, annotations, and status copy aligned with actual side effects. If a tool summarizes or prepares next actions, mark it read-only and avoid words like "save" unless it persists authoritative backend state.

## Related Documentation

- `docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md` documents the earlier lifecycle fix: widget-first routing, `requestClose()`, and close metadata.
- `docs/solutions/integration-issues/python-mcp-trip-clarification-hardening-20260510.md` documents server-side validation for `session_json`, `answers_json`, and direct model-call ergonomics.
- `docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md` documents the broader data/render tool split.
- `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md` explains why Storybook must simulate Apps bridge behavior and inspect nested widget iframes.
