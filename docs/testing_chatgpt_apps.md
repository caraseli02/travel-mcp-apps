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
| Travel agent | `8104` | `add_trip_item` / `list_trip_inbox` | `ui://trip/inbox-v2.html` |
| Travel agent | `8104` | `get_trip_board` | `ui://trip/board-v2.html` |
| Travel agent | `8104` | `get_trip_itinerary` | `ui://trip/itinerary-v1.html` |

The FastAPI app also mounts the unified travel-agent MCP endpoint at
`/mcp/travel-agent/`. Prefer that endpoint for ChatGPT Developer Mode when
testing the real app flow because it exposes trip tools plus weather, travel
tips, activity recommendations, and packing from one connection.

Each Apps-aware tool uses:

- `_meta.ui.resourceUri`
- `_meta["openai/outputTemplate"]`
- top-level `structuredContent`
- `content`
- `_meta`

Official docs used for this shape:

- https://developers.openai.com/apps-sdk/build/mcp-server
- https://developers.openai.com/apps-sdk/build/chatgpt-ui
- https://developers.openai.com/apps-sdk/reference

## Layer 1: MCP Protocol Check

Start the weather server:

```bash
source .venv/bin/activate
python mcp_servers/weather_server.py
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

Bridge behavior is validated by confirming that each widget renders real tool
output in ChatGPT Developer Mode:

- `get_current_weather` renders `ui://weather/dashboard-v5.html`.
- `get_forecast` renders `ui://weather/forecast-chart-v2.html`.
- `generate_packing_list` renders `ui://packing/checklist-v2.html`.
- `get_destination_tips` renders `ui://travel/destination-guide-v2.html`.
- `recommend_activities` renders `ui://travel/activity-cards-v2.html`.
- `add_trip_item` and `list_trip_inbox` render `ui://trip/inbox-v2.html`.
- `get_trip_board` renders `ui://trip/board-v2.html`.
- `get_trip_itinerary` renders `ui://trip/itinerary-v1.html`.

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
   MCP_DEV_TUNNEL=1 python mcp_servers/weather_server.py

   # Travel tips widgets
   MCP_DEV_TUNNEL=1 python mcp_servers/travel_tips_server.py

   # Packing widget
   MCP_DEV_TUNNEL=1 python mcp_servers/packing_server.py

   # Unified travel agent widgets and tools
   MCP_DEV_TUNNEL=1 python mcp_servers/travel_agent_server.py
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
   Get the current weather for Madrid.
   Show me the 5-day weather forecast for Madrid.
   Generate a packing list for a 5-day trip to Amsterdam. Use rainy_mild as the weather forecast.
   Show me destination tips for Madrid.
   Recommend activities in London for rainy spring weather.
   Create a Tokyo trip, save this hotel option, then show my trip inbox.
   Move the saved hotel to shortlisted and show my trip board.
   Add a Day 1 morning museum visit to the trip, move it to shortlisted, then show my day-by-day itinerary.
   ```

6. Expected result: ChatGPT calls the matching tool and renders the associated widget.

## Hosted Validation Path

For the current product direction, prefer the mounted FastAPI endpoint:

```text
https://your-fastapi-cloud-domain.example/mcp/travel-agent/
```

Required environment:

- `OPENWEATHER_API_KEY` for real weather.
- `DATABASE_URL` or `NEON_DATABASE_URL` for durable Trip Inbox and Trip Board storage.
- `TRIP_STORE_BACKEND=file` only for temporary smoke tests where losing `/tmp` data is acceptable.

Minimum Developer Mode script:

```text
Create a Tokyo trip.
Save this hotel option to the Tokyo trip: Booking.com hotel near Shibuya, about $180/night.
Show my trip inbox.
Move the hotel to shortlisted.
Show my trip board.
Get the current weather for Tokyo.
Generate a packing list for a 5-day Tokyo trip using that forecast.
```

Pass condition: ChatGPT calls the unified endpoint, renders the Trip Inbox and Trip Board widgets, and can call weather and packing tools without connecting separate MCP apps.

## What Not To Change Yet

Do not rewrite the weather service, OpenWeather integration, or MCP tool result again unless the protocol checks fail.

The next useful changes are:

- decide how production hosting will expose MCP endpoints
- add production `_meta.ui.domain` after the public domain is known
- prepare submission artifacts only after hosted Developer Mode testing works
