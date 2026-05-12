import asyncio
import os
from collections import defaultdict
from datetime import UTC, datetime, timedelta
from typing import Any

import aiohttp
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
OPENWEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
OPENWEATHER_CACHE_TTL = timedelta(minutes=10)
OPENWEATHER_TIMEOUT_SECONDS = 10
OPENWEATHER_MAX_RETRIES = 3

_weather_cache: dict[str, tuple[datetime, dict[str, Any]]] = {}


class OpenWeatherError(RuntimeError):
    """Raised when OpenWeather cannot return usable weather data."""


def get_openweather_api_key() -> str:
    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if not api_key:
        raise OpenWeatherError("OPENWEATHER_API_KEY is not configured")
    return api_key


def validate_city(city: str) -> str:
    normalized_city = city.strip()
    if not normalized_city:
        raise ValueError("city must not be empty")
    return normalized_city


def celsius_to_fahrenheit(celsius: float) -> int:
    return round((celsius * 9 / 5) + 32)


def _cache_get(key: str) -> dict[str, Any] | None:
    cached = _weather_cache.get(key)
    if not cached:
        return None

    cached_at, data = cached
    if datetime.now(UTC) - cached_at > OPENWEATHER_CACHE_TTL:
        del _weather_cache[key]
        return None

    return data


def _cache_set(key: str, data: dict[str, Any]) -> None:
    _weather_cache[key] = (datetime.now(UTC), data)


async def fetch_openweather_json(
    url: str,
    params: dict[str, Any],
    *,
    session: aiohttp.ClientSession | None = None,
) -> dict[str, Any]:
    owns_session = session is None
    active_session = session or aiohttp.ClientSession(
        timeout=aiohttp.ClientTimeout(total=OPENWEATHER_TIMEOUT_SECONDS)
    )

    try:
        for attempt in range(OPENWEATHER_MAX_RETRIES):
            try:
                async with active_session.get(url, params=params) as response:
                    if response.status == 404:
                        raise OpenWeatherError("city was not found")

                    if response.status == 401:
                        raise OpenWeatherError("OpenWeather API key was rejected")

                    if response.status == 429:
                        retry_after = response.headers.get("Retry-After")
                        message = "OpenWeather rate limit reached"
                        if retry_after:
                            message = f"{message}; retry after {retry_after} seconds"
                        raise OpenWeatherError(message)

                    if response.status >= 500 and attempt < OPENWEATHER_MAX_RETRIES - 1:
                        await _sleep_for_retry(attempt)
                        continue

                    if response.status >= 400:
                        error_text = await response.text()
                        raise OpenWeatherError(
                            f"OpenWeather request failed with status {response.status}: {error_text}"
                        )

                    return await response.json()
            except (aiohttp.ClientError, TimeoutError) as exc:
                if attempt >= OPENWEATHER_MAX_RETRIES - 1:
                    raise OpenWeatherError("OpenWeather request failed after retries") from exc
                await _sleep_for_retry(attempt)
    finally:
        if owns_session:
            await active_session.close()

    raise OpenWeatherError("OpenWeather request failed")


async def _sleep_for_retry(attempt: int) -> None:
    await asyncio.sleep(2**attempt)


async def fetch_current_weather(
    city: str,
    *,
    api_key: str | None = None,
    session: aiohttp.ClientSession | None = None,
) -> dict[str, Any]:
    normalized_city = validate_city(city)
    cache_key = f"current:{normalized_city.lower()}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    payload = await fetch_openweather_json(
        OPENWEATHER_CURRENT_URL,
        {
            "q": normalized_city,
            "appid": api_key or get_openweather_api_key(),
            "units": "metric",
        },
        session=session,
    )
    data = normalize_current_weather(payload)
    _cache_set(cache_key, data)
    return data


async def fetch_weather_forecast(
    city: str,
    days: int = 5,
    *,
    api_key: str | None = None,
    session: aiohttp.ClientSession | None = None,
) -> dict[str, Any]:
    normalized_city = validate_city(city)
    if days < 1 or days > 5:
        raise ValueError("days must be between 1 and 5")

    cache_key = f"forecast:{normalized_city.lower()}:{days}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    payload = await fetch_openweather_json(
        OPENWEATHER_FORECAST_URL,
        {
            "q": normalized_city,
            "appid": api_key or get_openweather_api_key(),
            "units": "metric",
        },
        session=session,
    )
    data = normalize_forecast(payload, days)
    _cache_set(cache_key, data)
    return data


def normalize_current_weather(payload: dict[str, Any]) -> dict[str, Any]:
    main = payload.get("main", {})
    wind = payload.get("wind", {})
    weather = payload.get("weather") or [{}]
    city = payload.get("name", "")
    temperature_celsius = round(float(main.get("temp", 0)))
    timestamp = datetime.fromtimestamp(payload.get("dt", 0), UTC)

    return {
        "city": city,
        "temperature_celsius": temperature_celsius,
        "temperature_fahrenheit": celsius_to_fahrenheit(temperature_celsius),
        "conditions": weather[0].get("description", "unknown").title(),
        "humidity": int(main.get("humidity", 0)),
        "wind_speed": round(float(wind.get("speed", 0))),
        "precipitation_probability": current_precipitation_probability(payload),
        "icon": weather[0].get("icon", ""),
        "timestamp": timestamp.isoformat(),
    }


def normalize_forecast(payload: dict[str, Any], days: int) -> dict[str, Any]:
    grouped_entries: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for entry in payload.get("list", []):
        forecast_time = datetime.fromtimestamp(entry.get("dt", 0), UTC)
        grouped_entries[forecast_time.date().isoformat()].append(entry)

    forecasts = [
        normalize_forecast_day(date, entries)
        for date, entries in list(grouped_entries.items())[:days]
    ]

    return {
        "city": payload.get("city", {}).get("name", ""),
        "forecasts": forecasts,
    }


def normalize_forecast_day(date: str, entries: list[dict[str, Any]]) -> dict[str, Any]:
    temperatures = [float(entry.get("main", {}).get("temp", 0)) for entry in entries]
    humidities = [int(entry.get("main", {}).get("humidity", 0)) for entry in entries]
    wind_speeds = [float(entry.get("wind", {}).get("speed", 0)) for entry in entries]
    precipitation_probs = [float(entry.get("pop", 0)) for entry in entries]
    representative = closest_to_noon(entries)
    weather = (representative.get("weather") or [{}])[0]

    temp_high_c = round(max(temperatures))
    temp_low_c = round(min(temperatures))

    return {
        "date": date,
        "temp_high_c": temp_high_c,
        "temp_low_c": temp_low_c,
        "temp_high_f": celsius_to_fahrenheit(temp_high_c),
        "temp_low_f": celsius_to_fahrenheit(temp_low_c),
        "conditions": weather.get("description", "unknown").title(),
        "precipitation_prob": round(max(precipitation_probs) * 100),
        "humidity": round(sum(humidities) / len(humidities)),
        "wind_speed": round(sum(wind_speeds) / len(wind_speeds)),
        "icon": weather.get("icon", ""),
    }


def closest_to_noon(entries: list[dict[str, Any]]) -> dict[str, Any]:
    return min(
        entries,
        key=lambda entry: abs(datetime.fromtimestamp(entry.get("dt", 0), UTC).hour - 12),
    )


def current_precipitation_probability(payload: dict[str, Any]) -> int:
    if payload.get("rain") or payload.get("snow"):
        return 100
    return 0
