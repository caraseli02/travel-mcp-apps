from services.travel_tips import get_destination_tips_data, recommend_activities_data


def test_destination_tips_include_required_rich_fields() -> None:
    result = get_destination_tips_data("Madrid")

    assert result["coordinates"] == {"lat": 40.4168, "lon": -3.7038}
    assert result["tips"]
    assert result["activities"]
    assert {"duration_hours", "cost_usd", "weather_dependent"} <= set(result["activities"][0])


def test_destination_data_has_five_cities() -> None:
    cities = ["London", "Madrid", "Paris", "Tokyo", "New York"]

    assert all(get_destination_tips_data(city) for city in cities)


def test_recommend_activities_uses_weather_flags() -> None:
    result = recommend_activities_data("Amsterdam", "rain", "spring") if False else recommend_activities_data("London", "rain", "spring")

    activity_names = [activity["name"] for activity in result["activities"]]
    assert "British Museum" in activity_names
