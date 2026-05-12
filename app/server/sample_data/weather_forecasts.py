import json
from typing import Any


SAMPLE_WEATHER_FORECASTS: dict[str, dict[str, Any]] = {
    "cold": {
        "city": "Reykjavik",
        "forecasts": [
            {
                "date": "2026-02-01",
                "temp_high_c": 3,
                "temp_low_c": -4,
                "temp_high_f": 37,
                "temp_low_f": 25,
                "conditions": "Snow",
                "precipitation_prob": 55,
                "humidity": 82,
                "wind_speed": 18,
                "icon": "13d",
            }
        ],
    },
    "mild": {
        "city": "London",
        "forecasts": [
            {
                "date": "2026-04-15",
                "temp_high_c": 16,
                "temp_low_c": 9,
                "temp_high_f": 61,
                "temp_low_f": 48,
                "conditions": "Cloudy",
                "precipitation_prob": 25,
                "humidity": 70,
                "wind_speed": 12,
                "icon": "03d",
            }
        ],
    },
    "warm": {
        "city": "Barcelona",
        "forecasts": [
            {
                "date": "2026-06-20",
                "temp_high_c": 27,
                "temp_low_c": 20,
                "temp_high_f": 81,
                "temp_low_f": 68,
                "conditions": "Sunny",
                "precipitation_prob": 5,
                "humidity": 52,
                "wind_speed": 8,
                "icon": "01d",
            }
        ],
    },
    "hot": {
        "city": "Dubai",
        "forecasts": [
            {
                "date": "2026-07-10",
                "temp_high_c": 39,
                "temp_low_c": 31,
                "temp_high_f": 102,
                "temp_low_f": 88,
                "conditions": "Clear",
                "precipitation_prob": 0,
                "humidity": 35,
                "wind_speed": 10,
                "icon": "01d",
            }
        ],
    },
    "rainy_mild": {
        "city": "Amsterdam",
        "forecasts": [
            {
                "date": "2026-05-05",
                "temp_high_c": 18,
                "temp_low_c": 11,
                "temp_high_f": 64,
                "temp_low_f": 52,
                "conditions": "Rain",
                "precipitation_prob": 70,
                "humidity": 88,
                "wind_speed": 16,
                "icon": "10d",
            }
        ],
    },
}


def sample_weather_forecast_json(case: str) -> str:
    return json.dumps(SAMPLE_WEATHER_FORECASTS[case])
