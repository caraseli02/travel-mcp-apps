# Testing ChatGPT Apps Widgets

This project has two different testing layers:

1. MCP protocol testing.
2. ChatGPT Apps widget bridge testing.

Do not treat them as the same thing. The MCP Inspector can prove that tools, resources, prompts, and `structuredContent` are correct. A widget preview only proves data binding if the preview provides `window.openai` or the MCP Apps bridge.

## Current Apps Widget Status

Current widget resources:

- MIME type: `text/html;profile=mcp-app`

| Server | Port | Tool | Widget resource |
| --- | ---: | --- | --- |
| Weather | `8101` | `get_current_weather` | `ui://weather/dashboard-v5.html` |
| Weather | `8101` | `get_forecast` | `ui://weather/forecast-chart-v2.html` |
| Packing | `8103` | `generate_packing_list` | `ui://packing/checklist-v2.html` |
| Travel tips | `8102` | `get_destination_tips` | `ui://travel/destination-guide-v2.html` |
| Travel tips | `8102` | `recommend_activities` | `ui://travel/activity-cards-v2.html` |
| Travel agent | `8104` | `list_trip_inbox` | `ui://trip/inbox-v2.html` |
| Travel agent | `8104` | `render_trip_board` | `ui://trip/board-v3.html` |
| Travel agent | `8104` | `get_trip_itinerary` | `ui://trip/itinerary-v3.html` |
| Travel agent | `8104` | `get_trip_budget` | `ui://trip/budget-v3.html` |
| Travel agent | `8104` | `ask_trip_clarification` | `ui://trip/clarification-v1.html` |
| Travel agent | `8104` | `render_trip_clarification` | `ui://trip/clarification-v1.html` |

Travel-agent widget source now lives under `app/web`. The Python resource
readers use checked-in `app/web/*.html` files as the runtime source of truth;
`app/web/dist` is package/build output and should match source after a build.

```bash
cd app/web
npm install
npm run typecheck
npm run build:widgets
npm run storybook
```

The FastAPI app also mounts the unified travel-agent MCP endpoint at
`/mcp/travel-agent/`. Prefer that endpoint for ChatGPT Developer Mode when
testing the MVP app flow because it exposes the persisted trip workspace tools.
Weather, forecast, destination guide, activity cards, and packing widgets are
not part of the current MVP validation surface.

Each Apps-aware render tool uses:

- `_meta.ui.resourceUri`
- `_meta["openai/outputTemplate"]`
- top-level `structuredContent`
- `content`
- `_meta`

Data and mutation tools such as `add_trip_item`, `update_trip_item_status`, and
`get_trip_board` intentionally omit widget templates so ChatGPT can reason over
the updated `structuredContent` before deciding whether a visual widget is
useful.

Official docs used for this shape:

- https://developers.openai.com/apps-sdk/build/mcp-server
- https://developers.openai.com/apps-sdk/build/chatgpt-ui
- https://developers.openai.com/apps-sdk/reference

## Layer 1: MCP Protocol Check

Start the weather server:

```bash
source .venv/bin/activate
python app/server/weather/mcp.py
```

Server URL:

```text
http://127.0.0.1:8101/mcp
```

Call the tool:

```json
{
  "city": "Madrid"
}
```

Expected response shape:

```json
{
  "_meta": {},
  "content": [
    {
      "type": "text",
      "text": "Showing current weather for Madrid."
    }
  ],
  "structuredContent": {
    "city": "Madrid",
    "temperature_celsius": 22
  },
  "isError": false
}
```

Also verify that reading `ui://weather/dashboard-v5.html` returns:

```json
{
  "mimeType": "text/html;profile=mcp-app",
  "_meta": {
    "ui": {
      "prefersBorder": true,
      "csp": {
        "connectDomains": [],
        "resourceDomains": []
      }
    },
    "openai/widgetDescription": "Shows the current weather for the requested city."
  }
}
```

If these checks pass, the MCP server side is good enough for this phase.

## Layer 2: Widget Bridge Check

The widgets no longer show visible bridge debug status text. Local preview
files inject mock `window.openai.toolOutput` so you can inspect layout before
testing in ChatGPT.

Bridge behavior for MVP is validated by confirming that each trip workspace
widget renders real tool output in ChatGPT Developer Mode:

- `list_trip_inbox` renders `ui://trip/inbox-v2.html`.
- `get_trip_board` fetches board data without rendering a widget.
- `render_trip_board` renders `ui://trip/board-v3.html`.
- `get_trip_itinerary` renders `ui://trip/itinerary-v3.html`.
- `get_trip_budget` renders `ui://trip/budget-v3.html`.
- `ask_trip_clarification` opens `ui://trip/clarification-v1.html` for simple vague trip, hotel, and flight requests.
- `submit_trip_clarification` returns `_meta["openai/closeWidget"] = true` so transient question widgets can close after successful submit.

## ChatGPT Developer Mode Path

For a real ChatGPT Apps test, the MCP endpoint must be reachable by ChatGPT over HTTPS.

Local development shape, using the server port for the widget you are testing:

```text
ChatGPT Developer Mode
        |
        v
HTTPS tunnel
        |
        v
http://127.0.0.1:<server-port>/mcp
```

Recommended local steps:

1. Start the target server:

   ```bash
   source .venv/bin/activate
   # Weather widgets
   MCP_DEV_TUNNEL=1 python app/server/weather/mcp.py

   # Travel tips widgets
   MCP_DEV_TUNNEL=1 python app/server/travel_tips/mcp.py

   # Packing widget
   MCP_DEV_TUNNEL=1 python app/server/packing/mcp.py

   # Unified travel agent widgets and tools
   MCP_DEV_TUNNEL=1 python app/server/travel_agent/mcp.py
   ```

   `MCP_DEV_TUNNEL=1` disables localhost-only DNS rebinding protection for this
   development server process so an HTTPS tunnel hostname can reach `/mcp`.
   Leave it off for normal local MCP Inspector testing.

2. Expose the matching port with an HTTPS tunnel.

   Examples with ngrok:

   ```bash
   ngrok http 8101  # weather
   ngrok http 8102  # travel tips
   ngrok http 8103  # packing
   ngrok http 8104  # unified travel agent
   ```

3. Use the HTTPS tunnel URL with `/mcp` as the MCP server URL.

   Example:

   ```text
   https://example-ngrok-url.ngrok-free.app/mcp
   ```

4. Connect that URL in ChatGPT Developer Mode.

5. Ask ChatGPT to call one of the target tools:

   ```text
   I want to plan a trip to Venice.
   I want to book hotel in Paris.
   I want to book fly to Tokyo.
   Create a Tokyo trip, save this hotel option, then show my trip inbox.
   Move the saved hotel to shortlisted, fetch the trip board, and show the visual trip board.
   Add a Day 1 morning museum visit to the trip, move it to shortlisted, then show my day-by-day itinerary.
   ```

6. Expected result: ChatGPT calls the matching tool and renders the associated widget.

## Hosted Validation Path

For the current product direction, prefer the mounted FastAPI endpoint:

```text
https://your-fastapi-cloud-domain.example/mcp/travel-agent/
```

Required environment:

- `DATABASE_URL` or `NEON_DATABASE_URL` for durable Trip Inbox and Trip Board storage.
- `TRIP_STORE_BACKEND=file` only for temporary smoke tests where losing `/tmp` data is acceptable.

MVP Developer Mode script:

```text
I want to plan a trip to Venice.
Answer the clarification questions in the widget and confirm ChatGPT continues from those answers.
Create a Tokyo trip.
Save this hotel option to the Tokyo trip: Booking.com hotel near Shibuya, about $180/night.
Show my trip inbox.
Move the hotel to shortlisted.
Fetch my trip board, then show the visual trip board.
Add a Day 1 morning museum visit to the trip, move it to shortlisted, then show my day-by-day itinerary.
Show my trip budget.
```

Pass condition: ChatGPT calls the unified endpoint, persists trip state, renders
the Trip Inbox, Trip Board, Trip Itinerary, and Trip Budget widgets when useful,
and completes the trip workspace flow without weather, forecast, destination
guide, activity card, or packing widgets.

## What Not To Change Yet

Do not rewrite the weather service, OpenWeather integration, or MCP tool result for the MVP. Weather and forecast are outside the current ChatGPT app validation scope.

The next useful changes are:

- decide how production hosting will expose MCP endpoints
- add production `_meta.ui.domain` after the public domain is known
- prepare submission artifacts only after hosted Developer Mode testing works
