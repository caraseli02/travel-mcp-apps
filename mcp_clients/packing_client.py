import json
from typing import Any

from mcp_clients.base_client import MCPClient


class PackingClient:
    def __init__(self, url: str) -> None:
        self.client = MCPClient(url)

    async def generate_packing_list(
        self,
        destination: str,
        duration_days: int,
        weather_forecast: dict[str, Any],
    ) -> dict[str, Any]:
        result = await self.client.call_tool(
            "generate_packing_list",
            {
                "destination": destination,
                "duration_days": duration_days,
                "weather_forecast": json.dumps(weather_forecast),
            },
        )
        if not isinstance(result, dict):
            raise ValueError("Packing MCP returned an unexpected response")
        return result

    async def health(self) -> list[str]:
        return await self.client.list_tools()
