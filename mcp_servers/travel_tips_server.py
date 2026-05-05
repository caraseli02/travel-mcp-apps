import json
import os
import sys
from pathlib import Path

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from mcp.types import CallToolResult, TextContent

from services.travel_tips import get_destination_tips_data, recommend_activities_data

WIDGETS_DIR = Path(__file__).resolve().parent / "widgets"


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
    description="Get travel tips and recommendations for a destination",
    meta={
        "ui": {"resourceUri": "ui://travel/destination-guide-v2.html"},
        "openai/outputTemplate": "ui://travel/destination-guide-v2.html",
    },
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
    description="Recommend activities based on weather and season",
    meta={
        "ui": {"resourceUri": "ui://travel/activity-cards-v2.html"},
        "openai/outputTemplate": "ui://travel/activity-cards-v2.html",
    },
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


if __name__ == "__main__":
    server.run("streamable-http")
