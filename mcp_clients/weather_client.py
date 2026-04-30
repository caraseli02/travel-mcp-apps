from typing import Any

from mcp_clients.base_client import MCPClient


class WeatherClient:
    def __init__(self, url: str) -> None:
        self.client = MCPClient(url)

    async def get_forecast(self, city: str, days: int = 5) -> dict[str, Any]:
        result = await self.client.call_tool("get_forecast", {"city": city, "days": days})
        if not isinstance(result, dict):
            raise ValueError("Weather MCP returned an unexpected response")
        return result

    async def get_current_weather(self, city: str) -> dict[str, Any]:
        result = await self.client.call_tool("get_current_weather", {"city": city})
        if not isinstance(result, dict):
            raise ValueError("Weather MCP returned an unexpected response")
        return result

    async def health(self) -> list[str]:
        return await self.client.list_tools()
