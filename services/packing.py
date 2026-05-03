import json
from typing import Any

from sample_data.weather_forecasts import SAMPLE_WEATHER_FORECASTS

PACKING_TEMPLATES = {
    "freezing": ["Heavy winter coat", "Gloves", "Scarf", "Thermal underwear", "Warm boots"],
    "cold": ["Warm jacket", "Sweaters", "Long pants", "Closed shoes"],
    "cool": ["Light jacket or sweater", "Long pants", "Layered clothing"],
    "mild": ["Light layers", "Long-sleeve shirts", "Comfortable pants"],
    "warm": ["T-shirts", "Shorts", "Sunscreen", "Sunglasses"],
    "hot": ["Light clothing", "Sandals", "High SPF sunscreen", "Water bottle"],
}

BASE_PACKING_CATEGORIES = {
    "toiletries": ["Toothbrush", "Toothpaste", "Deodorant", "Medication"],
    "electronics": ["Phone charger", "Power adapter", "Headphones"],
    "documents": ["Passport or ID", "Travel insurance", "Booking confirmations"],
    "accessories": ["Day bag", "Reusable water bottle"],
}


def parse_weather_forecast(weather_forecast: str) -> dict[str, Any]:
    weather_forecast = weather_forecast.strip()
    if not weather_forecast:
        return SAMPLE_WEATHER_FORECASTS["warm"]

    if weather_forecast in SAMPLE_WEATHER_FORECASTS:
        return SAMPLE_WEATHER_FORECASTS[weather_forecast]

    try:
        data = json.loads(weather_forecast)
    except json.JSONDecodeError as exc:
        raise ValueError("weather_forecast must be valid JSON") from exc

    forecasts = data.get("forecasts")
    if not isinstance(forecasts, list) or not forecasts:
        raise ValueError("weather_forecast must include a non-empty forecasts list")

    return data


def summarize_forecast(forecast_data: dict[str, Any]) -> dict[str, Any]:
    forecasts = forecast_data["forecasts"]
    lows = [day["temp_low_c"] for day in forecasts]
    highs = [day["temp_high_c"] for day in forecasts]
    precipitation = [day.get("precipitation_prob", 0) for day in forecasts]

    min_temp = min(lows)
    max_temp = max(highs)
    max_precipitation = max(precipitation)

    if min_temp < 0:
        category = "freezing"
    elif min_temp < 5:
        category = "cold"
    elif min_temp < 12:
        category = "cool"
    elif max_temp > 30:
        category = "hot"
    elif max_temp >= 20:
        category = "warm"
    else:
        category = "mild"

    return {
        "city": forecast_data.get("city", ""),
        "weather_category": category,
        "min_temp_c": min_temp,
        "max_temp_c": max_temp,
        "max_precipitation_prob": max_precipitation,
        "rain_expected": max_precipitation > 30,
    }


def clothing_quantity_note(duration_days: int) -> str:
    if duration_days <= 3:
        return "Pack 3 days of core clothing."
    extra_blocks = (duration_days - 3 + 1) // 2
    return f"Pack 3 days of core clothing plus {extra_blocks} extra clothing set(s)."


def build_packing_list(destination: str, duration_days: int, weather_forecast: str) -> dict[str, Any]:
    if duration_days <= 0:
        raise ValueError("duration_days must be greater than 0")

    normalized_destination = destination.strip()
    if not normalized_destination:
        raise ValueError("destination must not be empty")

    forecast_data = parse_weather_forecast(weather_forecast)
    summary = summarize_forecast(forecast_data)

    categories = {
        "clothing": list(PACKING_TEMPLATES[summary["weather_category"]]),
        **{category: list(items) for category, items in BASE_PACKING_CATEGORIES.items()},
    }

    weather_based_items = []
    if summary["rain_expected"]:
        categories["accessories"].extend(["Umbrella", "Rain jacket"])
        weather_based_items.extend(
            [
                {
                    "item": "Umbrella",
                    "reason": f"Precipitation probability reaches {summary['max_precipitation_prob']}%",
                },
                {
                    "item": "Rain jacket",
                    "reason": f"Precipitation probability reaches {summary['max_precipitation_prob']}%",
                },
            ]
        )

    if duration_days > 3:
        categories["accessories"].append("Laundry bag")

    return {
        "destination": normalized_destination,
        "duration_days": duration_days,
        "weather_summary": summary,
        "categories": categories,
        "weather_based_items": weather_based_items,
        "notes": [clothing_quantity_note(duration_days)],
    }
