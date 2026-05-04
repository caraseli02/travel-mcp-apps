from pathlib import Path
import os
import sys

from mcp.types import CallToolResult, TextContent

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings

from services.packing import build_packing_list


def local_transport_security() -> TransportSecuritySettings | None:
    if os.getenv("MCP_DEV_TUNNEL") == "1":
        return TransportSecuritySettings(enable_dns_rebinding_protection=False)

    return None


server = FastMCP(
    "packing-server",
    host="127.0.0.1",
    port=8103,
    transport_security=local_transport_security(),
)


@server.tool(
    name="generate_packing_list",
    description="Generate packing list based on weather and trip duration",
    meta={
        "ui": {"resourceUri": "ui://packing/checklist-v2.html"},
        "openai/outputTemplate": "ui://packing/checklist-v2.html",
    },
)
def generate_packing_list(
    destination: str, duration_days: int, weather_forecast: str
) -> CallToolResult:
    """Generate comprehensive packing list."""
    try:
        packing_list = build_packing_list(destination, duration_days, weather_forecast)
        return CallToolResult(
            structuredContent=packing_list,
            content=[
                TextContent(
                    type="text",
                    text=f"Generated packing checklist for {packing_list['destination']}.",
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


@server.prompt(name="packing_advisor", description="Get personalized packing advice")
def packing_advisor(
    origin: str, destination: str, duration: int, activities: str
) -> list[dict]:
    return [
        {
            "role": "user",
            "content": (
                f"Create a packing list for a {duration}-day trip from {origin} "
                f"to {destination}. Planned activities: {activities}. "
                f"Consider weather differences and provide specific recommendations."
            ),
        }
    ]


WIDGETS_DIR = Path(__file__).resolve().parent / "widgets"


@server.resource(
    "ui://packing/checklist-v2.html",
    name="packing_checklist_ui",
    description="Packing checklist UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows a categorized packing checklist for the trip.",
    },
)
def packing_checklist_ui() -> str:
    return (WIDGETS_DIR / "packing_checklist_v2.html").read_text(encoding="utf-8")


if __name__ == "__main__":
    server.run("streamable-http")
