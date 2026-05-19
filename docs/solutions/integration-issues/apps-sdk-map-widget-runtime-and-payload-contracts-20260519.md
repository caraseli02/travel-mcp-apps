---
title: "Fix Apps SDK Map Widget Runtime and Payload Contracts"
module: "Travel MCP ChatGPT Apps"
date: 2026-05-19
problem_type: integration_issue
component: apps_sdk_map_widget_runtime
severity: high
status: resolved
root_cause: map_widget_contract_split_between_storybook_component_mcp_payload_and_hosted_apps_runtime
resolution_type: runtime_contract_and_payload_hardening
tags:
  - chatgpt-apps
  - apps-sdk
  - mcp
  - fastmcp
  - widgets
  - vite
  - react
  - mapbox
  - pizzaz
  - csp
  - structured-content
  - bridge
related_files:
  - app/server/travel_agent/mcp.py
  - app/web/src/trip-components/TravelMap.tsx
  - app/web/src/trip-components/types.ts
  - app/web/runtime_templates/trip_map_v1.html
  - app/web/scripts/build-runtime-widgets.mjs
  - tests/test_travel_agent_server.py
  - tests/test_apps_ui_resources.py
related_docs:
  - docs/solutions/integration-issues/apps-sdk-vite-widget-asset-delivery-and-bridge-contract-20260515.md
  - docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md
  - docs/solutions/integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md
  - docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md
  - docs/plans/2026-05-14-001-feat-travel-pizzaz-component-transformation-plan.md
---

# Fix Apps SDK Map Widget Runtime and Payload Contracts

## Problem

The travel map widget had a Mapbox-capable React component, but it did not reliably work as a live pin-based map inside GPT Apps. The hosted Apps runtime needed more than the Storybook component did:

- The `ui://trip/map-v1.html` resource needed Mapbox domains in widget CSP.
- The `render_trip_map` tool needed to send a browser-safe public Mapbox token at runtime.
- Saved trip options needed `lat` / `lon` coordinates, not only local preview `x` / `y` positions.
- The output schema needed to describe the real widget payload instead of a generic object.
- The runtime HTML had to remain self-contained for Apps testing while preserving the Pizzaz-derived map behavior.

The visible symptom was that ChatGPT could show board or itinerary views, but could not produce a true map-pin view. Local preview paths also masked the issue because the fallback map could render without a Mapbox token or network permissions.

## Root Cause

The bug was not simply a missing import. It was a contract split between three layers:

1. The React widget knew how to initialize Mapbox.
2. The MCP server did not provide Mapbox-ready data and resource metadata.
3. The deployed GPT Apps iframe could not read local `.env` values or make external requests unless the resource contract allowed them.

The Pizzaz example proved Mapbox could be used in the component layer, but GPT Apps still requires the MCP resource and tool result to carry the production runtime contract.

## What Did Not Work

Removing Mapbox from the runtime or falling back to a local-only mock map would have made tests pass, but it would not satisfy the GPT Apps use case. The user explicitly needed live Mapbox testing in Apps, even with mock pin coordinates.

Build-time-only token injection was also insufficient. A generated runtime template can read `VITE_MAPBOX_ACCESS_TOKEN` during frontend builds, but FastAPI Cloud needs a server-side runtime path. The browser iframe should receive only a public `pk.*` token through tool `structuredContent`.

## Solution

The fix made the Apps runtime contract explicit.

### Allow Mapbox in Resource CSP

`app/server/travel_agent/mcp.py` defines shared Mapbox CSP metadata and applies it only to the trip map resource:

```python
MAPBOX_CSP = {
    "connectDomains": [
        "https://api.mapbox.com",
        "https://events.mapbox.com",
    ],
    "resourceDomains": [
        "https://api.mapbox.com",
        "https://events.mapbox.com",
    ],
}
```

```python
@server.resource(
    "ui://trip/map-v1.html",
    name="Trip Map UI",
    description="Visual saved trip places map.",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {"prefersBorder": True, "csp": MAPBOX_CSP},
        "openai/widgetDescription": (
            "Shows saved trip places as Mapbox pins, using mock coordinates "
            "when exact coordinates are not saved."
        ),
    },
)
def trip_map_ui() -> str:
    return _read_widget_html("trip_map_v1.html")
```

### Pass Only Public Runtime Tokens

The server now exposes a token only when it is browser-safe:

```python
def _public_mapbox_access_token() -> str | None:
    token = os.getenv("MAPBOX_ACCESS_TOKEN", "").strip() or os.getenv("VITE_MAPBOX_ACCESS_TOKEN", "").strip()
    if not token:
        return None
    if not token.startswith("pk."):
        return None
    return token
```

The token is attached to `render_trip_map` `structuredContent`:

```python
payload: dict[str, Any] = {"trip": trip_dict, "options": options, "media": media}
mapbox_access_token = _public_mapbox_access_token()
if mapbox_access_token:
    payload["mapbox_access_token"] = mapbox_access_token
return payload
```

For FastAPI Cloud, configure one of:

```bash
fastapi cloud env set --secret MAPBOX_ACCESS_TOKEN "pk.your-public-mapbox-token"
fastapi cloud env set --secret VITE_MAPBOX_ACCESS_TOKEN "pk.your-public-mapbox-token"
```

Never use or expose a Mapbox `sk.*` token in widget payloads or generated HTML.

### Add Mapbox-Usable Mock Coordinates

Existing trip data does not store geocoded coordinates. The server now derives deterministic mock coordinates around known destinations so GPT Apps can render pins immediately:

```python
DESTINATION_COORDINATES: dict[str, tuple[float, float]] = {
    "amsterdam": (52.3676, 4.9041),
    "barcelona": (41.3874, 2.1686),
    "lisbon": (38.7223, -9.1393),
    "london": (51.5072, -0.1276),
    "madrid": (40.4168, -3.7038),
    "paris": (48.8566, 2.3522),
    "porto": (41.1579, -8.6291),
    "rome": (41.9028, 12.4964),
    "tokyo": (35.6762, 139.6503),
    "venice": (45.4408, 12.3155),
}
```

The payload keeps local fallback `x` / `y` positions and adds `lat` / `lon` for Mapbox.

### Tighten Tool Schemas and Payload Bounds

The travel option schema now describes the coordinate contract and optional runtime token:

```python
TRAVEL_COORDINATES_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["x", "y"],
    "properties": {
        "x": {"type": "number"},
        "y": {"type": "number"},
        "lat": {"type": "number"},
        "lon": {"type": "number"},
    },
    "additionalProperties": True,
}
```

`render_trip_map` and related render tools now use specific output schemas, bounded option counts, truncated text fields, normalized prices/currencies, and no fabricated scores or pros/cons.

### Prefer Runtime Token in the Widget

`TravelMap.tsx` now reads the token from tool data first and initializes Mapbox only when there are real marker coordinates:

```ts
const markerOptions = React.useMemo(
  () => filtered.filter((option) => option.coordinates?.lat != null && option.coordinates?.lon != null),
  [filtered],
);

const mapboxAccessToken = error ? "" : data.mapbox_access_token || BUILD_MAPBOX_ACCESS_TOKEN;
const showFallbackMap = mapError || !mapboxAccessToken || markerOptions.length === 0;
```

The fallback preview remains important. It lets local previews and no-token environments show visible pins instead of a blank card, while hosted GPT Apps can use live Mapbox when the public token and CSP are present.

### Keep Runtime HTML Self-Contained

`trip_map_v1.html` remains a self-contained generated runtime template. This intentionally bundles Mapbox for the map widget so GPT Apps can test the live map without separately hosted JS chunks. `build-runtime-widgets.mjs` also strips trailing whitespace from generated templates to keep `git diff --check` clean.

This is a deliberate exception to the component-library guidance to lazy-load and split Mapbox: the component build can optimize chunking, but the MCP Apps runtime needs a single deliverable HTML resource unless assets are explicitly hosted and allowlisted.

## Verification

The fix was verified with:

```bash
.venv/bin/python -m pytest tests/test_travel_agent_server.py tests/test_apps_ui_resources.py
cd app/web && npm run typecheck
cd app/web && npm run build
cd app/web && npm run build-storybook
git diff --check
```

The Python test run passed with `36 passed`.

A Playwright smoke test against `app/web/runtime_templates/trip_map_v1.html` with a Venice payload also verified that the runtime rendered the map title and three pins.

Important test coverage:

- `test_trip_map_resource_declares_mapbox_csp`
- `test_render_trip_map_returns_mock_mapbox_coordinates`
- `test_render_trip_map_includes_only_public_mapbox_token`
- `test_new_render_tools_have_specific_output_schemas`

## Prevention

Treat third-party map widgets as a separate runtime class from normal cards, boards, and itinerary views. They need coordinated checks across resource metadata, tool output data, frontend initialization, and hosted deployment configuration.

Recommended guardrails:

- Keep `mapbox-gl` isolated to the map entrypoint or `TravelMap` path.
- Require widget CSP tests for every external browser-side service.
- Require `render_trip_map` tests to assert finite `lat` / `lon` coordinates.
- Assert that `sk.*` tokens are never exposed in `structuredContent`.
- Keep a visible no-token fallback for local development and Developer Mode.
- Run a hosted GPT Apps smoke test after FastAPI Cloud env changes.
- Watch runtime template size; `trip_map_v1.html` is large because Mapbox is intentionally bundled.
- Add secret scanning or targeted tests for generated templates so real tokens are never committed.

## Related Follow-Up

The older component-layer solution `docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md` still correctly recommends lazy Mapbox loading for the React component build. It should be refreshed to clarify that `trip_map_v1.html` may intentionally inline Mapbox for the GPT Apps runtime.

Suggested targeted refresh:

```bash
/prompts:ce-compound-refresh Apps SDK map runtime after bundled Mapbox template CSP and public token support
```
