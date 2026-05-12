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

from app.server.services.travel_tips import get_destination_tips_data, recommend_activities_data

WIDGETS_DIR = Path(__file__).resolve().parents[1] / "widgets"
READ_ONLY = ToolAnnotations(
    readOnlyHint=True,
    destructiveHint=False,
    idempotentHint=True,
    openWorldHint=False,
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
        if tool.name in {"get_destination_tips", "recommend_activities"}:
            tool.__dict__["output_schema"] = {"anyOf": [OBJECT_SCHEMA, ERROR_OUTPUT_SCHEMA]}


def local_transport_security() -> TransportSecuritySettings | None:
    if os.getenv("MCP_DEV_TUNNEL") == "1":
        return TransportSecuritySettings(enable_dns_rebinding_protection=False)

    return None


server = FastMCP(
    "travel-tips-server",
    host="127.0.0.1",
    port=8102,
    transport_security=local_transport_security(),
)


@server.tool(
    name="get_destination_tips",
    title="Show destination tips",
    description="Get travel tips and recommendations for a destination",
    annotations=READ_ONLY,
    meta=_render_meta(
        "ui://travel/destination-guide-v2.html",
        "Loading destination tips",
        "Loaded destination tips",
    ),
)
def get_destination_tips(city: str) -> CallToolResult:
    try:
        data = get_destination_tips_data(city)
        return CallToolResult(
            structuredContent=data,
            content=[
                TextContent(
                    type="text",
                    text=f"Showing destination guide for {data.get('city', city)}.",
                )
            ],
            _meta={},
        )
    except ValueError as exc:
        return CallToolResult(
            structuredContent={"error": str(exc)},
            content=[TextContent(type="text", text=str(exc))],
            _meta={},
            isError=True,
        )


@server.tool(
    name="recommend_activities",
    title="Recommend activities",
    description="Recommend activities based on weather and season",
    annotations=READ_ONLY,
    meta=_render_meta(
        "ui://travel/activity-cards-v2.html",
        "Loading activities",
        "Loaded activities",
    ),
)
def recommend_activities(city: str, weather: str, season: str) -> CallToolResult:
    try:
        recommendations = recommend_activities_data(city, weather, season)
        return CallToolResult(
            structuredContent=recommendations,
            content=[
                TextContent(
                    type="text",
                    text=f"Showing activity recommendations for {recommendations.get('city', city)}.",
                )
            ],
            _meta={},
        )
    except ValueError as exc:
        return CallToolResult(
            structuredContent={"error": str(exc)},
            content=[TextContent(type="text", text=str(exc))],
            _meta={},
            isError=True,
        )


@server.prompt(
    name="destination_briefing",
    description="Generate comprehensive destination briefing",
)
def destination_briefing(city: str, duration_days: int) -> list[dict]:
    return [
        {
            "role": "user",
            "content": (
                f"Create a {duration_days}-day travel briefing for {city}. "
                f"Include must-see attractions, local customs, transportation tips, "
                f"and daily itinerary suggestions."
            ),
        }
    ]


@server.resource(
    "ui://travel/destination-guide-v2.html",
    name="travel_destination_guide_ui",
    description="Destination guide UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows a compact destination guide with travel tips and first activity picks.",
    },
)
def travel_destination_guide_ui() -> str:
    return (WIDGETS_DIR / "travel_destination_guide_v2.html").read_text(
        encoding="utf-8"
    )


@server.resource(
    "ui://travel/activity-cards-v2.html",
    name="travel_activity_cards_ui",
    description="Activity recommendation cards UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows activity recommendations matched to weather and season.",
    },
)
def travel_activity_cards_ui() -> str:
    return (WIDGETS_DIR / "travel_activity_cards_v3.html").read_text(
        encoding="utf-8"
    )


_register_output_schemas()


if __name__ == "__main__":
    server.run("streamable-http")
