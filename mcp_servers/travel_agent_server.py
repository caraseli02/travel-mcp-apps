from pathlib import Path
import os
import sys
from typing import Callable

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from mcp.types import CallToolResult, TextContent

from app.config import get_settings
from mcp_servers.packing_server import generate_packing_list as packing_generate_packing_list
from mcp_servers.travel_tips_server import (
    get_destination_tips as travel_get_destination_tips,
    recommend_activities as travel_recommend_activities,
)
from mcp_servers.weather_server import (
    get_current_weather as weather_get_current_weather,
    get_forecast as weather_get_forecast,
)
from services.trips import (
    FileTripStore,
    PostgresTripStore,
    TripConfigError,
    TripNotFoundError,
    TripStoreError,
    TripValidationError,
    build_board,
    build_budget,
    build_itinerary,
    item_to_dict,
    summarize_items,
    trip_to_dict,
)

WIDGETS_DIR = Path(__file__).resolve().parent / "widgets"
_STORE: PostgresTripStore | FileTripStore | None = None


def local_transport_security() -> TransportSecuritySettings | None:
    if os.getenv("MCP_DEV_TUNNEL") == "1":
        return TransportSecuritySettings(enable_dns_rebinding_protection=False)

    return None


server = FastMCP(
    "travel-agent-server",
    host="127.0.0.1",
    port=8104,
    transport_security=local_transport_security(),
)


def get_trip_store() -> PostgresTripStore | FileTripStore:
    global _STORE
    if _STORE is None:
        settings = get_settings()
        backend = settings.trip_store_backend.strip().lower()
        if backend == "file":
            _STORE = FileTripStore(settings.trip_store_file_path)
        elif backend == "postgres":
            _STORE = PostgresTripStore(settings.trip_database_url)
        else:
            raise TripConfigError("TRIP_STORE_BACKEND must be either 'postgres' or 'file'.")
    return _STORE


def _text(message: str) -> list[TextContent]:
    return [TextContent(type="text", text=message)]


def _tool_error(exc: Exception) -> CallToolResult:
    return CallToolResult(
        structuredContent={"error": str(exc)},
        content=_text(str(exc)),
        _meta={},
        isError=True,
    )


def _run_trip_tool(action: Callable[[], CallToolResult]) -> CallToolResult:
    try:
        return action()
    except (TripConfigError, TripValidationError, TripNotFoundError) as exc:
        return _tool_error(exc)
    except TripStoreError as exc:
        return _tool_error(exc)
    except Exception as exc:
        return _tool_error(RuntimeError(f"Trip persistence failed: {exc}"))


@server.tool(
    name="create_trip",
    description="Create a persistent trip workspace backed by Postgres.",
)
def create_trip(
    title: str,
    destination: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
) -> CallToolResult:
    def action() -> CallToolResult:
        trip = get_trip_store().create_trip(title, destination, start_date, end_date)
        return CallToolResult(
            structuredContent={"trip": trip_to_dict(trip)},
            content=_text(f"Created trip workspace: {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="add_trip_item",
    description="Save a raw travel fragment into a trip inbox, deduped by normalized content.",
    meta={
        "ui": {"resourceUri": "ui://trip/inbox-v2.html"},
        "openai/outputTemplate": "ui://trip/inbox-v2.html",
    },
)
def add_trip_item(
    trip_id: str,
    raw_content: str,
    item_type: str | None = None,
    source_label: str | None = None,
    title: str | None = None,
    day_label: str | None = None,
    date_note: str | None = None,
    price_note: str | None = None,
    location_note: str | None = None,
    notes: str | None = None,
) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        item, deduped = store.add_item(
            trip_id=trip_id,
            raw_content=raw_content,
            item_type=item_type,
            source_label=source_label,
            title=title,
            day_label=day_label,
            date_note=date_note,
            price_note=price_note,
            location_note=location_note,
            notes=notes,
        )
        inbox = [item_to_dict(inbox_item) for inbox_item in store.list_items(trip_id, "inbox")]
        trip = store.get_trip(trip_id)
        return CallToolResult(
            structuredContent={
                "trip": trip_to_dict(trip),
                "item": item_to_dict(item),
                "items": inbox,
                "deduped": deduped,
            },
            content=_text(
                "That fragment was already in the trip inbox."
                if deduped
                else "Saved the fragment to the trip inbox."
            ),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="list_trip_inbox",
    description="List unprocessed inbox items for a trip.",
    meta={
        "ui": {"resourceUri": "ui://trip/inbox-v2.html"},
        "openai/outputTemplate": "ui://trip/inbox-v2.html",
    },
)
def list_trip_inbox(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        items = [item_to_dict(item) for item in store.list_items(trip_id, "inbox")]
        return CallToolResult(
            structuredContent={"trip": trip_to_dict(trip), "items": items},
            content=_text(f"Showing {len(items)} inbox item(s) for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="update_trip_item_status",
    description="Move a trip item to inbox, shortlisted, booked, rejected, or needs_review.",
)
def update_trip_item_status(
    item_id: str,
    status: str,
    day_label: str | None = None,
    notes: str | None = None,
) -> CallToolResult:
    def action() -> CallToolResult:
        item = get_trip_store().update_item_status(item_id, status, day_label, notes)
        return CallToolResult(
            structuredContent={"item": item_to_dict(item)},
            content=_text(f"Moved item to {item.status}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="get_trip_board",
    description="Show the trip board grouped into decisions, shortlist, booked items, itinerary draft, and missing pieces.",
    meta={
        "ui": {"resourceUri": "ui://trip/board-v2.html"},
        "openai/outputTemplate": "ui://trip/board-v2.html",
    },
)
def get_trip_board(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        board = build_board(trip, store.list_items(trip_id))
        return CallToolResult(
            structuredContent=board,
            content=_text(f"Showing trip board for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="get_trip_itinerary",
    description="Show the trip schedule as a day-by-day itinerary timeline.",
    meta={
        "ui": {"resourceUri": "ui://trip/itinerary-v1.html"},
        "openai/outputTemplate": "ui://trip/itinerary-v1.html",
    },
)
def get_trip_itinerary(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        itinerary = build_itinerary(trip, store.list_items(trip_id))
        return CallToolResult(
            structuredContent=itinerary,
            content=_text(f"Showing day-by-day itinerary for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="get_trip_budget",
    description="Show tracked trip spending against any saved budget target.",
    meta={
        "ui": {"resourceUri": "ui://trip/budget-v1.html"},
        "openai/outputTemplate": "ui://trip/budget-v1.html",
    },
)
def get_trip_budget(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        budget = build_budget(trip, store.list_items(trip_id))
        return CallToolResult(
            structuredContent=budget,
            content=_text(f"Showing spending tracker for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="get_trip_summary",
    description="Summarize saved trip state and missing planning pieces.",
)
def get_trip_summary(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        items = store.list_items(trip_id)
        board = build_board(trip, items)
        counts = summarize_items(items)
        missing = board["lanes"]["missing_pieces"]
        return CallToolResult(
            structuredContent={
                "trip": trip_to_dict(trip),
                "counts": counts,
                "missing_pieces": missing,
            },
            content=_text(
                f"{trip.title} has {counts['total']} saved item(s). "
                f"Missing pieces: {len(missing)}."
            ),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="get_current_weather",
    description="Get current weather from the unified travel-agent endpoint.",
    meta={
        "ui": {"resourceUri": "ui://weather/dashboard-v5.html"},
        "openai/outputTemplate": "ui://weather/dashboard-v5.html",
    },
)
async def get_current_weather(city: str) -> CallToolResult:
    return await weather_get_current_weather(city)


@server.tool(
    name="get_forecast",
    description="Get a weather forecast from the unified travel-agent endpoint.",
    meta={
        "ui": {"resourceUri": "ui://weather/forecast-chart-v2.html"},
        "openai/outputTemplate": "ui://weather/forecast-chart-v2.html",
    },
)
async def get_forecast(city: str, days: int = 5) -> CallToolResult:
    return await weather_get_forecast(city, days)


@server.tool(
    name="get_destination_tips",
    description="Get destination tips from the unified travel-agent endpoint.",
    meta={
        "ui": {"resourceUri": "ui://travel/destination-guide-v2.html"},
        "openai/outputTemplate": "ui://travel/destination-guide-v2.html",
    },
)
def get_destination_tips(city: str) -> CallToolResult:
    return travel_get_destination_tips(city)


@server.tool(
    name="recommend_activities",
    description="Recommend activities from the unified travel-agent endpoint.",
    meta={
        "ui": {"resourceUri": "ui://travel/activity-cards-v2.html"},
        "openai/outputTemplate": "ui://travel/activity-cards-v2.html",
    },
)
def recommend_activities(city: str, weather: str, season: str) -> CallToolResult:
    return travel_recommend_activities(city, weather, season)


@server.tool(
    name="generate_packing_list",
    description="Generate a packing list from the unified travel-agent endpoint.",
    meta={
        "ui": {"resourceUri": "ui://packing/checklist-v2.html"},
        "openai/outputTemplate": "ui://packing/checklist-v2.html",
    },
)
def generate_packing_list(
    destination: str, duration_days: int, weather_forecast: str
) -> CallToolResult:
    return packing_generate_packing_list(destination, duration_days, weather_forecast)


@server.resource(
    "ui://weather/dashboard-v5.html",
    name="weather_dashboard_ui",
    description="Interactive weather dashboard UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows the current weather for the requested city.",
    },
)
def weather_dashboard_ui() -> str:
    return (WIDGETS_DIR / "weather_dashboard_v5.html").read_text(encoding="utf-8")


@server.resource(
    "ui://weather/forecast-chart-v2.html",
    name="weather_forecast_chart_ui",
    description="5-day weather forecast chart UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows a compact multi-day weather forecast for the requested city.",
    },
)
def weather_forecast_chart_ui() -> str:
    return (WIDGETS_DIR / "weather_forecast_chart_v2.html").read_text(encoding="utf-8")


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


@server.resource(
    "ui://travel/destination-guide-v2.html",
    name="travel_destination_guide_ui",
    description="Destination guide UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows a compact destination guide with travel tips and first activity picks.",
    },
)
def travel_destination_guide_ui() -> str:
    return (WIDGETS_DIR / "travel_destination_guide_v2.html").read_text(encoding="utf-8")


@server.resource(
    "ui://travel/activity-cards-v2.html",
    name="travel_activity_cards_ui",
    description="Activity recommendation cards UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows activity recommendations matched to weather and season.",
    },
)
def travel_activity_cards_ui() -> str:
    return (WIDGETS_DIR / "travel_activity_cards_v2.html").read_text(encoding="utf-8")


@server.resource(
    "ui://trip/inbox-v2.html",
    name="trip_inbox_ui",
    description="Trip Inbox UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows saved raw travel fragments that still need review.",
    },
)
def trip_inbox_ui() -> str:
    return (WIDGETS_DIR / "trip_inbox_v2.html").read_text(encoding="utf-8")


@server.resource(
    "ui://trip/board-v2.html",
    name="trip_board_ui",
    description="Trip Board UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows a trip board grouped by decisions, shortlist, booked items, draft itinerary, and missing pieces.",
    },
)
def trip_board_ui() -> str:
    return (WIDGETS_DIR / "trip_board_v2.html").read_text(encoding="utf-8")


@server.resource(
    "ui://trip/itinerary-v1.html",
    name="trip_itinerary_ui",
    description="Trip itinerary timeline UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows scheduled trip items grouped into a day-by-day itinerary.",
    },
)
def trip_itinerary_ui() -> str:
    return (WIDGETS_DIR / "trip_itinerary_v1.html").read_text(encoding="utf-8")


@server.resource(
    "ui://trip/budget-v1.html",
    name="trip_budget_ui",
    description="Trip spending tracker UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows tracked trip spending against a saved budget target.",
    },
)
def trip_budget_ui() -> str:
    return (WIDGETS_DIR / "trip_budget_v1.html").read_text(encoding="utf-8")


if __name__ == "__main__":
    server.run("streamable-http")
