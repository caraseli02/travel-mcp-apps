from contextlib import AsyncExitStack, asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.mcp_mounts import MCP_SERVERS, mount_mcp_servers
from app.routers import health, travel


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with AsyncExitStack() as stack:
        for server in MCP_SERVERS:
            await stack.enter_async_context(server.session_manager.run())
        yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Travel Tip Planner API",
        description="FastAPI orchestrator for a learning-by-doing MCP travel planner.",
        version="0.1.0",
        debug=settings.debug,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/health", tags=["health"])
    app.include_router(travel.router, prefix="/api/v1/travel", tags=["travel"])
    mount_mcp_servers(app)

    @app.get("/", tags=["root"])
    async def root() -> dict[str, str]:
        return {
            "message": "Travel Tip Planner API",
            "version": "0.1.0",
            "docs": "/docs",
            "health": "/health",
        }

    return app


app = create_app()
