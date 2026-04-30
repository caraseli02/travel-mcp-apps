from collections.abc import Callable

from mcp_servers.packing_server import packing_checklist_ui
from mcp_servers.travel_tips_server import (
    travel_activity_cards_ui,
    travel_destination_guide_ui,
)
from mcp_servers.weather_server import weather_dashboard_ui, weather_forecast_chart_ui


WIDGETS: list[tuple[str, Callable[[], str], str]] = [
    ("ui://weather/dashboard-v4.html", weather_dashboard_ui, "Current weather"),
    ("ui://weather/forecast-chart-v1.html", weather_forecast_chart_ui, "5-day forecast"),
    ("ui://packing/checklist-v1.html", packing_checklist_ui, "Packing checklist"),
    ("ui://travel/destination-guide-v1.html", travel_destination_guide_ui, "Destination guide"),
    ("ui://travel/activity-cards-v1.html", travel_activity_cards_ui, "Activity picks"),
]


def test_apps_ui_resources_are_complete_html_documents() -> None:
    for _uri, read_resource, expected_text in WIDGETS:
        html = read_resource()

        assert html.startswith("<!doctype html>")
        assert "<html" in html
        assert "<style>" in html
        assert "<script>" in html
        assert expected_text in html


def test_apps_ui_resources_are_self_contained() -> None:
    for _uri, read_resource, _expected_text in WIDGETS:
        html = read_resource()

        assert "http://" not in html
        assert "https://" not in html
        assert "<script src=" not in html
        assert "<link" not in html


def test_apps_ui_resources_include_bridge_update_handlers() -> None:
    for _uri, read_resource, _expected_text in WIDGETS:
        html = read_resource()

        assert "window.openai?.toolOutput" in html
        assert "openai:set_globals" in html
        assert "ui/notifications/tool-result" in html
