from fastapi.testclient import TestClient
import httpx
import pytest
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

from app.main import app
from mcp_clients.packing_client import PackingClient
from mcp_clients.travel_client import TravelTipsClient
from mcp_clients.weather_client import WeatherClient


client = TestClient(app)


def test_root() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Travel Tip Planner API"


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.anyio
async def test_mounted_mcp_servers_list_tools() -> None:
    endpoints = [
        ("/mcp/weather/", {"get_current_weather", "get_forecast"}),
        ("/mcp/travel/", {"get_destination_tips", "recommend_activities"}),
        ("/mcp/packing/", {"generate_packing_list"}),
        (
            "/mcp/travel-agent/",
            {
                "create_trip",
                "add_trip_item",
                "list_trip_inbox",
                "update_trip_item_status",
                "get_trip_board",
                "get_trip_summary",
                "get_current_weather",
                "get_forecast",
                "get_destination_tips",
                "recommend_activities",
                "generate_packing_list",
            },
        ),
    ]

    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as http_client:
            for path, expected_tools in endpoints:
                async with streamable_http_client(
                    f"http://testserver{path}", http_client=http_client
                ) as (
                    read,
                    write,
                    _,
                ):
                    async with ClientSession(read, write) as session:
                        await session.initialize()
                        result = await session.list_tools()

                assert {tool.name for tool in result.tools} == expected_tools


def test_travel_plan_placeholder() -> None:
    response = client.post(
        "/api/v1/travel/plan",
        json={
            "origin_city": "Madrid",
            "destination_city": "Paris",
            "start_date": "2026-06-01",
            "end_date": "2026-06-05",
        },
    )

    assert response.status_code == 202
    assert response.json()["status"] in {"partial", "complete"}


def test_create_travel_plan_with_mcp_clients(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_forecast(self, city: str, days: int = 5):
        return {
            "city": city,
            "forecasts": [
                {
                    "date": "2026-06-01",
                    "temp_high_c": 26,
                    "temp_low_c": 18,
                    "precipitation_prob": 10,
                }
            ],
        }

    async def fake_tips(self, city: str):
        return {"city": city, "activities": []}

    async def fake_packing(self, destination: str, duration_days: int, weather_forecast: dict):
        return {"destination": destination, "duration_days": duration_days, "categories": {}}

    monkeypatch.setattr(WeatherClient, "get_forecast", fake_forecast)
    monkeypatch.setattr(TravelTipsClient, "get_destination_tips", fake_tips)
    monkeypatch.setattr(PackingClient, "generate_packing_list", fake_packing)

    response = client.post(
        "/api/v1/travel/plan",
        json={
            "origin_city": "Madrid",
            "destination_city": "Paris",
            "start_date": "2026-06-01",
            "end_date": "2026-06-05",
        },
    )

    assert response.status_code == 202
    body = response.json()
    assert body["status"] == "complete"
    assert body["plan"]["destination_city"] == "Paris"
    assert body["plan"]["weather_forecast"]["city"] == "Paris"
