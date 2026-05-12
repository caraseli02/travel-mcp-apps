from pathlib import Path
import os
import sys
from typing import Any

if __package__ is None or __package__ == "":
    current_dir = str(Path(__file__).resolve().parent)
    sys.path = [path for path in sys.path if path != current_dir]
    sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from mcp.types import CallToolResult, TextContent, ToolAnnotations

from app.server.services.packing import build_packing_list
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
        if tool.name == "generate_packing_list":
            tool.__dict__["output_schema"] = {"anyOf": [OBJECT_SCHEMA, ERROR_OUTPUT_SCHEMA]}


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
    title="Generate packing list",
    description="Generate packing list based on weather and trip duration",
    annotations=READ_ONLY,
    meta=_render_meta(
        "ui://packing/checklist-v2.html",
        "Generating packing list",
        "Generated packing list",
    ),
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


WIDGETS_DIR = Path(__file__).resolve().parents[1] / "widgets"


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
    return (WIDGETS_DIR / "packing_checklist_v3.html").read_text(encoding="utf-8")


_register_output_schemas()


if __name__ == "__main__":
    server.run("streamable-http")
