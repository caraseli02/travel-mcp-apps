from services.openweather import normalize_current_weather, normalize_forecast


def test_normalize_current_weather() -> None:
    payload = {
        "name": "Paris",
        "dt": 1714300000,
        "main": {"temp": 18.2, "humidity": 65},
        "wind": {"speed": 3.6},
        "weather": [{"description": "partly cloudy", "icon": "02d"}],
    }

    result = normalize_current_weather(payload)

    assert result == {
        "city": "Paris",
        "temperature_celsius": 18,
        "temperature_fahrenheit": 64,
        "conditions": "Partly Cloudy",
        "humidity": 65,
        "wind_speed": 4,
        "precipitation_probability": 0,
        "icon": "02d",
        "timestamp": "2024-04-28T10:26:40+00:00",
    }


def test_normalize_forecast_groups_entries_by_day() -> None:
    payload = {
        "city": {"name": "Paris"},
        "list": [
            {
                "dt": 1714300000,
                "main": {"temp": 18, "humidity": 60},
                "wind": {"speed": 3},
                "pop": 0.2,
                "weather": [{"description": "clouds", "icon": "03d"}],
            },
            {
                "dt": 1714310800,
                "main": {"temp": 22, "humidity": 70},
                "wind": {"speed": 5},
                "pop": 0.4,
                "weather": [{"description": "rain", "icon": "10d"}],
            },
        ],
    }

    result = normalize_forecast(payload, days=1)

    assert result == {
        "city": "Paris",
        "forecasts": [
            {
                "date": "2024-04-28",
                "temp_high_c": 22,
                "temp_low_c": 18,
                "temp_high_f": 72,
                "temp_low_f": 64,
                "conditions": "Rain",
                "precipitation_prob": 40,
                "humidity": 65,
                "wind_speed": 4,
                "icon": "10d",
            }
        ],
    }
