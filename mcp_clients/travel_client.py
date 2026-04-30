from typing import Any

from mcp_clients.base_client import MCPClient


class TravelTipsClient:
    def __init__(self, url: str) -> None:
        self.client = MCPClient(url)

    async def get_destination_tips(self, city: str) -> dict[str, Any]:
        result = await self.client.call_tool("get_destination_tips", {"city": city})
        if not isinstance(result, dict):
            raise ValueError("Travel Tips MCP returned an unexpected response")
        return result

    async def recommend_activities(
        self,
        city: str,
        weather: str = "",
        season: str = "",
    ) -> dict[str, Any]:
        result = await self.client.call_tool(
            "recommend_activities",
            {"city": city, "weather": weather, "season": season},
        )
        if not isinstance(result, dict):
            raise ValueError("Travel Tips MCP returned an unexpected response")
        return result

    async def health(self) -> list[str]:
        return await self.client.list_tools()
