from fastapi import FastAPI
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings

from mcp_servers.packing_server import server as packing_mcp_server
from mcp_servers.travel_agent_server import server as travel_agent_mcp_server
from mcp_servers.travel_tips_server import server as travel_tips_mcp_server
from mcp_servers.weather_server import server as weather_mcp_server

MCP_SERVERS = [
    weather_mcp_server,
    travel_tips_mcp_server,
    packing_mcp_server,
    travel_agent_mcp_server,
]


def mounted_mcp_app(server: FastMCP):
    server.settings.streamable_http_path = "/"
    server.settings.stateless_http = True
    server.settings.transport_security = TransportSecuritySettings(
        enable_dns_rebinding_protection=False
    )
    return server.streamable_http_app()


def mount_mcp_servers(app: FastAPI) -> None:
    app.mount("/mcp/weather", mounted_mcp_app(weather_mcp_server))
    app.mount("/mcp/travel", mounted_mcp_app(travel_tips_mcp_server))
    app.mount("/mcp/packing", mounted_mcp_app(packing_mcp_server))
    app.mount("/mcp/travel-agent", mounted_mcp_app(travel_agent_mcp_server))
