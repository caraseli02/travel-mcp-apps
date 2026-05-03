from mcp_servers.packing_server import generate_packing_list
from sample_data.weather_forecasts import sample_weather_forecast_json
from services.packing import build_packing_list


def test_build_packing_list_adds_cold_weather_items() -> None:
    result = build_packing_list("Reykjavik", 4, sample_weather_forecast_json("cold"))

    # cold sample has min_temp=-4 which is now "freezing" category
    assert "Heavy winter coat" in result["categories"]["clothing"]
    assert "Gloves" in result["categories"]["clothing"]
    assert "Scarf" in result["categories"]["clothing"]
    assert "Thermal underwear" in result["categories"]["clothing"]
    assert result["weather_summary"]["weather_category"] == "freezing"


def test_build_packing_list_adds_rain_gear() -> None:
    result = build_packing_list("Amsterdam", 5, sample_weather_forecast_json("rainy_mild"))

    assert "Umbrella" in result["categories"]["accessories"]
    assert "Rain jacket" in result["categories"]["accessories"]
    assert result["weather_based_items"]


def test_generate_packing_list_returns_json_error_for_bad_forecast() -> None:
    result = generate_packing_list("Madrid", 3, "not-json")

    assert result.isError is True
    assert result.structuredContent == {"error": "weather_forecast must be valid JSON"}


def test_generate_packing_list_uses_default_forecast_for_empty_input() -> None:
    result = generate_packing_list("Madrid", 3, "")

    assert result.structuredContent["weather_summary"]["weather_category"] == "warm"


def test_generate_packing_list_accepts_sample_case_name() -> None:
    result = generate_packing_list("Amsterdam", 5, "rainy_mild")

    assert result.structuredContent["weather_summary"]["rain_expected"] is True
    assert "Umbrella" in result.structuredContent["categories"]["accessories"]
