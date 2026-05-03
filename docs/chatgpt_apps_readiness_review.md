# ChatGPT Apps Readiness Review

Date: 2026-05-03

## Current Classification

Primary archetype: `submission-ready`, eventually.

Current stage: hosted-runtime validation pending. The MCP foundation, Apps-aware resources, unified travel-agent endpoint, and Trip Inbox / Trip Board persistence path exist locally.

The repo now has local Streamable HTTP MCP servers, mounted FastAPI MCP endpoints, working tool descriptors, and first-pass widgets for weather, packing, travel tips, Trip Inbox, and Trip Board. It is not yet a fully validated ChatGPT app because widget bridge behavior still needs to be tested in ChatGPT Developer Mode against a public HTTPS endpoint.

## What Is On The Correct Path

- FastAPI Cloud is a reasonable hosting target for the public HTTPS backend.
- `pyproject.toml` has the FastAPI Cloud entrypoint: `app.main:app`.
- Dependencies include `mcp`, `aiohttp`, `pydantic-settings`, and `fastapi[standard]`.
- Runtime config is environment-based and keeps `OPENWEATHER_API_KEY` out of source.
- Health, travel API orchestration, and the unified `/mcp/travel-agent/` MCP endpoint exist.
- Tests exist and pass.
- The learning roadmap keeps MCP implementation as your work, with hints and references.
- The gstack `/office-hours` product direction is now captured in `docs/office_hours_trip_inbox_board_2026-04-30.md`.

## Current Gaps Before A ChatGPT App Can Work End-To-End

- Weather, packing, travel tips, Trip Inbox, and Trip Board now have first-pass Apps-aware UI resources.
- The local preview used during development does not provide `window.openai`, so it can load the HTML but cannot prove widget data binding.
- ChatGPT Developer Mode or a bridge-aware Apps inspector is still needed for true widget runtime validation.
- Production widget resource metadata still needs the final `_meta.ui.domain` once the FastAPI Cloud domain is known.
- Public submission artifacts are still pending: privacy policy, support contact, screenshots, test prompts, app metadata, and verified publisher readiness.

## Important Course Corrections

### 1. Use Current Widget MIME Type

Use:

```text
text/html;profile=mcp-app
```

Do not use the older `text/html+mcp` wording in new implementation.

### 2. Keep Tool Contracts Small And Intent-Based

Each user intent should map to one tool. For this app, start with:

- `get_current_weather`
- `get_forecast`
- `get_destination_tips`
- `recommend_activities`
- `generate_packing_list`
- `create_trip`
- `add_trip_item`
- `list_trip_inbox`
- `update_trip_item_status`
- `get_trip_board`
- `get_trip_summary`

Each tool should have:

- clear name
- title
- input schema
- `_meta.ui.resourceUri` when it renders a widget
- `structuredContent` for model and widget data
- `content` for model-readable narration
- `_meta` for widget-only details

Current implementation status:

- `get_current_weather` returns a real `CallToolResult` with top-level `structuredContent`.
- The weather UI resource is versioned as `ui://weather/dashboard-v4.html`.
- Weather, forecast, packing, destination guide, activity cards, Trip Inbox, and Trip Board resources use MIME type `text/html;profile=mcp-app`.
- `resources/read` returns resource `_meta` with UI CSP and widget description.
- `/mcp/travel-agent/` should be the primary ChatGPT Developer Mode endpoint because it exposes the trip tools and the domain tools through one connection.

### 3. Add Widget Metadata From The Start

Each UI resource should plan for:

```json
{
  "_meta": {
    "ui": {
      "prefersBorder": true,
      "domain": "https://your-production-domain.example",
      "csp": {
        "connectDomains": ["https://your-api-domain.example"],
        "resourceDomains": []
      }
    }
  }
}
```

For FastAPI Cloud, decide the final production domain before submission and use it consistently. During local development, leave `domain` out until the public HTTPS domain is real.

### 4. Version UI Resource URIs

Use versioned URIs once widgets are real:

```text
ui://weather/dashboard-v4.html
ui://weather/forecast-chart-v1.html
ui://packing/checklist-v1.html
ui://travel/destination-guide-v1.html
ui://travel/activity-cards-v1.html
ui://trip/inbox-v1.html
ui://trip/board-v1.html
```

When a widget changes incompatibly, publish a new URI instead of reusing the old one.

### 5. Keep ChatGPT Submission Separate From Developer Mode

Developer Mode is the correct target first. Public submission should happen only after:

- hosted HTTPS endpoint is stable
- app works in ChatGPT Developer Mode
- widget CSP/domain metadata is correct
- app has clear user value beyond plain ChatGPT conversation
- review artifacts are prepared

## Validation Performed

Commands:

```bash
python -m pytest
```

Result:

```text
48 passed, 1 skipped
```

Static review:

- FastAPI app exists and has a FastAPI Cloud entrypoint.
- Weather, travel tips, packing, and unified travel-agent MCP servers exist.
- Weather `get_current_weather` advertises `ui://weather/dashboard-v4.html`.
- Weather `get_current_weather` returns real top-level `structuredContent`, not JSON text.
- The weather, travel, packing, trip inbox, and trip board UI resources are readable and carry `text/html;profile=mcp-app`.
- Kiro docs and roadmap were updated away from stale `text/html+mcp` MIME wording.
- Trip persistence tests cover file-backed smoke testing and Postgres integration when `DATABASE_URL` is present.

## Next Correct Step

The local automated tests validate the core widget pattern across weather,
packing, travel tips, Trip Inbox, and Trip Board. Next, deploy the unified
`/mcp/travel-agent/` endpoint with `DATABASE_URL`, then test the full ChatGPT
Developer Mode flow against the public HTTPS domain.
