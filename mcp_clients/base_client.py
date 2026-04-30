import json
from typing import Any

from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client


class MCPClientError(RuntimeError):
    pass


class MCPClient:
    def __init__(self, url: str) -> None:
        self.url = url

    async def call_tool(self, name: str, arguments: dict[str, Any]) -> Any:
        try:
            async with streamable_http_client(self.url) as (read, write, _):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    result = await session.call_tool(name, arguments)
        except Exception as exc:
            raise MCPClientError(f"Could not call MCP tool {name} at {self.url}") from exc

        if result.structuredContent is not None:
            return result.structuredContent

        if not result.content:
            return None

        text = getattr(result.content[0], "text", "")
        if not text:
            return None

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return text

    async def list_tools(self) -> list[str]:
        try:
            async with streamable_http_client(self.url) as (read, write, _):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    result = await session.list_tools()
        except Exception as exc:
            raise MCPClientError(f"Could not list MCP tools at {self.url}") from exc

        return [tool.name for tool in result.tools]
