import pytest

from mcp_servers import travel_agent_server
from services.trips import FileTripStore, InMemoryTripStore


@pytest.fixture()
def trip_store(monkeypatch: pytest.MonkeyPatch) -> InMemoryTripStore:
    store = InMemoryTripStore()
    monkeypatch.setattr(travel_agent_server, "get_trip_store", lambda: store)
    return store


def test_create_trip_tool_returns_stable_trip_id(trip_store: InMemoryTripStore) -> None:
    result = travel_agent_server.create_trip("Tokyo", destination="Tokyo")

    assert result.isError is not True
    assert result.structuredContent["trip"]["id"]
    assert result.structuredContent["trip"]["title"] == "Tokyo"
    assert trip_store.get_trip(result.structuredContent["trip"]["id"]).destination == "Tokyo"


def test_add_trip_item_tool_returns_inbox_widget_shape(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("Barcelona")

    result = travel_agent_server.add_trip_item(
        trip.id,
        "Booking.com hotel near Gracia",
        source_label="Booking",
        title="Gracia hotel",
    )

    assert result.isError is not True
    assert result.structuredContent["trip"]["id"] == trip.id
    assert result.structuredContent["deduped"] is False
    assert result.structuredContent["item"]["item_type"] == "hotel"
    assert result.structuredContent["items"][0]["status"] == "inbox"


def test_add_trip_item_tool_marks_duplicates(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("Lisbon")
    first = travel_agent_server.add_trip_item(trip.id, "https://example.com/train/")
    second = travel_agent_server.add_trip_item(trip.id, "example.com/train")

    assert first.structuredContent["item"]["id"] == second.structuredContent["item"]["id"]
    assert second.structuredContent["deduped"] is True


def test_board_tool_groups_items_by_status(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("London")
    hotel = travel_agent_server.add_trip_item(trip.id, "Hotel near Soho").structuredContent["item"]
    activity = travel_agent_server.add_trip_item(
        trip.id,
        "British Museum visit",
        day_label="Day 1",
    ).structuredContent["item"]
    travel_agent_server.update_trip_item_status(hotel["id"], "booked")
    travel_agent_server.update_trip_item_status(activity["id"], "shortlisted")

    result = travel_agent_server.get_trip_board(trip.id)

    assert result.isError is not True
    assert result.structuredContent["lanes"]["booked"][0]["id"] == hotel["id"]
    assert result.structuredContent["lanes"]["shortlisted"][0]["id"] == activity["id"]
    assert result.structuredContent["lanes"]["itinerary_draft"][0]["id"] == activity["id"]


def test_trip_summary_reports_counts_and_missing_pieces(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("Madrid")
    travel_agent_server.add_trip_item(trip.id, "Dinner at Sobrino de Botin")

    result = travel_agent_server.get_trip_summary(trip.id)

    assert result.isError is not True
    assert result.structuredContent["counts"]["total"] == 1
    assert "Stay is not booked yet." in result.structuredContent["missing_pieces"]


def test_tool_returns_clear_error_when_database_url_missing(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(travel_agent_server, "_STORE", None)
    monkeypatch.setattr(
        travel_agent_server,
        "get_settings",
        lambda: type("Settings", (), {"trip_store_backend": "postgres", "trip_database_url": ""})(),
    )

    result = travel_agent_server.create_trip("Rome")

    assert result.isError is True
    assert result.structuredContent == {"error": "DATABASE_URL is required for trip persistence."}


def test_tool_uses_file_store_backend_when_configured(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path,
) -> None:
    monkeypatch.setattr(travel_agent_server, "_STORE", None)
    monkeypatch.setattr(
        travel_agent_server,
        "get_settings",
        lambda: type(
            "Settings",
            (),
            {
                "trip_store_backend": "file",
                "trip_store_file_path": str(tmp_path / "trips.json"),
                "trip_database_url": "",
            },
        )(),
    )

    result = travel_agent_server.create_trip("Rome")

    assert result.isError is not True
    assert isinstance(travel_agent_server.get_trip_store(), FileTripStore)


def test_tool_returns_mcp_error_for_store_connection_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail_store():
        raise RuntimeError("could not connect to Postgres")

    monkeypatch.setattr(travel_agent_server, "get_trip_store", fail_store)

    result = travel_agent_server.create_trip("Rome")

    assert result.isError is True
    assert result.structuredContent == {
        "error": "Trip persistence failed: could not connect to Postgres"
    }


def test_unified_server_registers_every_tool_output_template() -> None:
    templates = {
        "ui://trip/inbox-v1.html": travel_agent_server.trip_inbox_ui,
        "ui://trip/board-v1.html": travel_agent_server.trip_board_ui,
        "ui://weather/dashboard-v4.html": travel_agent_server.weather_dashboard_ui,
        "ui://weather/forecast-chart-v1.html": travel_agent_server.weather_forecast_chart_ui,
        "ui://packing/checklist-v1.html": travel_agent_server.packing_checklist_ui,
        "ui://travel/destination-guide-v1.html": travel_agent_server.travel_destination_guide_ui,
        "ui://travel/activity-cards-v1.html": travel_agent_server.travel_activity_cards_ui,
    }

    for uri, read_resource in templates.items():
        html = read_resource()

        assert html.startswith("<!doctype html>"), uri
        assert "window.openai?.toolOutput" in html, uri
