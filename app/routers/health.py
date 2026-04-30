from datetime import UTC, datetime

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from mcp_clients.base_client import MCPClientError
from mcp_clients.packing_client import PackingClient
from mcp_clients.travel_client import TravelTipsClient
from mcp_clients.weather_client import WeatherClient

router = APIRouter()


@router.get("")
async def health_check(settings: Settings = Depends(get_settings)) -> dict[str, object]:
    return {
        "status": "healthy",
        "service": "travel-tip-planner-api",
        "environment": settings.environment,
        "openweather_configured": settings.has_openweather_key,
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.get("/mcp")
async def mcp_readiness(settings: Settings = Depends(get_settings)) -> dict[str, object]:
    clients = {
        "weather": WeatherClient(str(settings.weather_mcp_url)),
        "travel_tips": TravelTipsClient(str(settings.travel_tips_mcp_url)),
        "packing": PackingClient(str(settings.packing_mcp_url)),
    }

    servers = {}
    for name, client in clients.items():
        try:
            tools = await client.health()
            servers[name] = {"status": "healthy", "tools": tools}
        except MCPClientError as exc:
            servers[name] = {"status": "unavailable", "error": str(exc)}

    status = "healthy" if all(server["status"] == "healthy" for server in servers.values()) else "partial"
    return {"status": status, "servers": servers}
