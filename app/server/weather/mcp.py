import json
import os
import sys
from pathlib import Path
from typing import Any

if __package__ is None or __package__ == "":
    current_dir = str(Path(__file__).resolve().parent)
    sys.path = [path for path in sys.path if path != current_dir]
    sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from mcp.types import CallToolResult, TextContent, ToolAnnotations

from app.server.services.openweather import (
    OpenWeatherError,
    fetch_current_weather,
    fetch_weather_forecast,
)

WIDGETS_DIR = Path(__file__).resolve().parents[1] / "widgets"
READ_ONLY_OPEN_WORLD = ToolAnnotations(
    readOnlyHint=True,
    destructiveHint=False,
    idempotentHint=True,
    openWorldHint=True,
)
OBJECT_SCHEMA: dict[str, Any] = {"type": "object", "additionalProperties": True}
ERROR_OUTPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["error"],
    "properties": {"error": {"type": "string"}},
    "additionalProperties": False,
}


def _status_meta(invoking: str, invoked: str) -> dict[str, str]:
    return {
        "openai/toolInvocation/invoking": invoking,
        "openai/toolInvocation/invoked": invoked,
    }


def _render_meta(resource_uri: str, invoking: str, invoked: str) -> dict[str, object]:
    return {
        "ui": {"resourceUri": resource_uri},
        "openai/outputTemplate": resource_uri,
        **_status_meta(invoking, invoked),
    }


def _register_output_schemas() -> None:
    for tool in server._tool_manager.list_tools():
        if tool.name in {"get_current_weather", "get_forecast"}:
            tool.__dict__["output_schema"] = {"anyOf": [OBJECT_SCHEMA, ERROR_OUTPUT_SCHEMA]}


def local_transport_security() -> TransportSecuritySettings | None:
    if os.getenv("MCP_DEV_TUNNEL") == "1":
        return TransportSecuritySettings(enable_dns_rebinding_protection=False)

    return None


server = FastMCP(
    "travel-weather-server",
    host="127.0.0.1",
    port=8101,
    transport_security=local_transport_security(),
)


@server.tool(
    name="get_current_weather",
    title="Show current weather",
    description="Get current weather for a city and render it in the weather dashboard",
    annotations=READ_ONLY_OPEN_WORLD,
    meta=_render_meta(
        "ui://weather/dashboard-v5.html",
        "Loading current weather",
        "Loaded current weather",
    ),
)
async def get_current_weather(city: str) -> CallToolResult:
    try:
        data = await fetch_current_weather(city)
        return CallToolResult(
            structuredContent=data,
            content=[
                TextContent(
                    type="text",
                    text=f"Showing current weather for {data.get('city', city)}.",
                )
            ],
            _meta={},
        )
    except (OpenWeatherError, ValueError) as exc:
        return CallToolResult(
            structuredContent={"error": str(exc)},
            content=[TextContent(type="text", text=str(exc))],
            _meta={},
            isError=True,
        )


@server.tool(
    name="get_forecast",
    title="Show weather forecast",
    description=(
        "Get 5-day weather forecast for a city. "
        "NOTE: This returns the forecast for the next 5 days from today, NOT future trip dates. "
        "For trips further out, use climate averages or historical data for the destination month."
    ),
    annotations=READ_ONLY_OPEN_WORLD,
    meta=_render_meta(
        "ui://weather/forecast-chart-v2.html",
        "Loading forecast",
        "Loaded forecast",
    ),
)
async def get_forecast(city: str, days: int = 5) -> CallToolResult:
    try:
        data = await fetch_weather_forecast(city, days)
        return CallToolResult(
            structuredContent=data,
            content=[
                TextContent(
                    type="text",
                    text=(
                        f"Showing {days}-day forecast for {data.get('city', city)}. "
                        f"Note: this covers the next {days} days from today. "
                        f"For future trip dates, ask about climate averages for that month."
                    ),
                )
            ],
            _meta={},
        )
    except (OpenWeatherError, ValueError) as exc:
        return CallToolResult(
            structuredContent={"error": str(exc)},
            content=[TextContent(type="text", text=str(exc))],
            _meta={},
            isError=True,
        )


@server.resource(
    "weather://forecast/{city}",
    name="city_forecast",
    description="5-day weather forecast for a city",
    mime_type="application/json",
)
async def city_forecast(city: str) -> str:
    """Return forecast as resource."""
    try:
        data = await fetch_weather_forecast(city)
        return json.dumps(data, indent=2)
    except (OpenWeatherError, ValueError) as exc:
        return json.dumps({"error": str(exc)}, indent=2)


@server.prompt(
    name="weather_comparison",
    description="Compare weather between two cities for travel planning",
)
def weather_comparison(origin: str, destination: str, travel_date: str) -> list[dict]:
    return [
        {
            "role": "user",
            "content": (
                f"Compare weather conditions between {origin} and {destination} "
                f"for travel on {travel_date}. Include temperature differences, "
                f"precipitation chances, and clothing recommendations."
            ),
        }
    ]


@server.resource(
    "ui://weather/dashboard-v5.html",
    name="weather_dashboard_ui",
    description="Interactive weather dashboard UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows the current weather for the requested city.",
    },
)
def weather_dashboard_ui() -> str:
    return (WIDGETS_DIR / "weather_dashboard_v5.html").read_text(encoding="utf-8")


@server.resource(
    "ui://weather/forecast-chart-v2.html",
    name="weather_forecast_chart_ui",
    description="5-day weather forecast chart UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows a compact multi-day weather forecast for the requested city.",
    },
)
def weather_forecast_chart_ui() -> str:
    return (WIDGETS_DIR / "weather_forecast_chart_v2.html").read_text(encoding="utf-8")


_register_output_schemas()


if __name__ == "__main__":
    server.run("streamable-http")
