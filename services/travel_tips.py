from typing import Any


DESTINATION_DATA: dict[str, dict[str, Any]] = {
    "london": {
        "city": "London",
        "country": "United Kingdom",
        "overview": "A dense city for museums, theatre, historic landmarks, markets, and riverside walks.",
        "best_time": "May-September",
        "coordinates": {"lat": 51.5074, "lon": -0.1278},
        "tips": [
            {
                "category": "transportation",
                "icon": "train",
                "text": "Use contactless payment or an Oyster card for Tube and bus trips.",
            },
            {
                "category": "weather",
                "icon": "umbrella",
                "text": "Carry a compact umbrella because showers can appear quickly.",
            },
            {
                "category": "booking",
                "icon": "ticket",
                "text": "Book theatre tickets and major attractions ahead for better prices.",
            },
        ],
        "activities": [
            {
                "id": "british-museum",
                "name": "British Museum",
                "category": "museum",
                "description": "Large collection of global history and culture with free entry.",
                "duration_hours": 3,
                "cost_usd": 0,
                "weather_dependent": False,
                "best_weather": ["rain", "cold", "cloudy"],
            },
            {
                "id": "tower-of-london",
                "name": "Tower of London",
                "category": "landmark",
                "description": "Historic fortress and Crown Jewels visit near Tower Bridge.",
                "duration_hours": 3,
                "cost_usd": 45,
                "weather_dependent": True,
                "best_weather": ["sunny", "cloudy", "mild"],
            },
            {
                "id": "thames-river-cruise",
                "name": "Thames River Cruise",
                "category": "outdoor",
                "description": "See major landmarks from the river between Westminster and Greenwich.",
                "duration_hours": 2,
                "cost_usd": 22,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild"],
            },
        ],
    },
    "madrid": {
        "city": "Madrid",
        "country": "Spain",
        "overview": "A walkable capital with art museums, parks, late dining, plazas, and tapas culture.",
        "best_time": "March-May, September-November",
        "coordinates": {"lat": 40.4168, "lon": -3.7038},
        "tips": [
            {
                "category": "culture",
                "icon": "clock",
                "text": "Dinner often starts after 9pm, especially on weekends.",
            },
            {
                "category": "weather",
                "icon": "sun",
                "text": "In summer, plan outdoor walks early or late to avoid peak heat.",
            },
            {
                "category": "transportation",
                "icon": "metro",
                "text": "The metro is efficient and usually easier than taxis for central trips.",
            },
        ],
        "activities": [
            {
                "id": "prado-museum",
                "name": "Prado Museum",
                "category": "museum",
                "description": "Major European art museum with works by Velazquez, Goya, and El Greco.",
                "duration_hours": 3,
                "cost_usd": 18,
                "weather_dependent": False,
                "best_weather": ["rain", "hot", "cold"],
            },
            {
                "id": "retiro-park",
                "name": "Retiro Park",
                "category": "outdoor",
                "description": "Large central park for walking, boating, and relaxed breaks.",
                "duration_hours": 2,
                "cost_usd": 0,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild", "warm"],
            },
            {
                "id": "tapas-tour",
                "name": "Tapas Tour",
                "category": "food",
                "description": "Evening route through tapas bars in La Latina or Huertas.",
                "duration_hours": 3,
                "cost_usd": 45,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
        ],
    },
    "paris": {
        "city": "Paris",
        "country": "France",
        "overview": "A landmark-rich city for art, food, architecture, gardens, and neighborhood wandering.",
        "best_time": "April-June, September-October",
        "coordinates": {"lat": 48.8566, "lon": 2.3522},
        "tips": [
            {
                "category": "transportation",
                "icon": "metro",
                "text": "Use the metro for cross-city hops, then walk within neighborhoods.",
            },
            {
                "category": "booking",
                "icon": "ticket",
                "text": "Reserve timed tickets for the Louvre and Eiffel Tower.",
            },
            {
                "category": "culture",
                "icon": "utensils",
                "text": "Lunch reservations help for popular bistros.",
            },
        ],
        "activities": [
            {
                "id": "louvre",
                "name": "Louvre Museum",
                "category": "museum",
                "description": "Vast art museum best visited with a focused route.",
                "duration_hours": 4,
                "cost_usd": 24,
                "weather_dependent": False,
                "best_weather": ["rain", "cold", "hot"],
            },
            {
                "id": "seine-walk",
                "name": "Seine Walk",
                "category": "outdoor",
                "description": "Scenic walk along bridges, bookstalls, and river views.",
                "duration_hours": 2,
                "cost_usd": 0,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild", "cloudy"],
            },
            {
                "id": "montmartre",
                "name": "Montmartre",
                "category": "neighborhood",
                "description": "Hilly neighborhood with Sacre-Coeur views and cafes.",
                "duration_hours": 3,
                "cost_usd": 0,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild"],
            },
        ],
    },
    "tokyo": {
        "city": "Tokyo",
        "country": "Japan",
        "overview": "A high-energy city for food, neighborhoods, transit, gardens, shopping, and pop culture.",
        "best_time": "March-May, October-November",
        "coordinates": {"lat": 35.6762, "lon": 139.6503},
        "tips": [
            {
                "category": "transportation",
                "icon": "train",
                "text": "Use a transit card and group activities by train line or neighborhood.",
            },
            {
                "category": "culture",
                "icon": "volume-2",
                "text": "Keep phone calls quiet on trains and follow queue etiquette.",
            },
            {
                "category": "cash",
                "icon": "banknote",
                "text": "Carry some cash for smaller restaurants and temples.",
            },
        ],
        "activities": [
            {
                "id": "asakusa-sensoji",
                "name": "Asakusa and Senso-ji",
                "category": "landmark",
                "description": "Historic temple area with food stalls and old Tokyo atmosphere.",
                "duration_hours": 3,
                "cost_usd": 0,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild", "cloudy"],
            },
            {
                "id": "teamlab-planets",
                "name": "teamLab Planets",
                "category": "museum",
                "description": "Immersive digital art installation that works well in bad weather.",
                "duration_hours": 2,
                "cost_usd": 28,
                "weather_dependent": False,
                "best_weather": ["rain", "hot", "cold"],
            },
            {
                "id": "shibuya-food",
                "name": "Shibuya Food Crawl",
                "category": "food",
                "description": "Evening route through ramen, izakaya, and dessert stops.",
                "duration_hours": 3,
                "cost_usd": 50,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
        ],
    },
    "new york": {
        "city": "New York",
        "country": "United States",
        "overview": "A dense city for neighborhoods, museums, food, parks, skyline views, and theatre.",
        "best_time": "April-June, September-November",
        "coordinates": {"lat": 40.7128, "lon": -74.0060},
        "tips": [
            {
                "category": "transportation",
                "icon": "train",
                "text": "Use the subway for most trips and check weekend service changes.",
            },
            {
                "category": "booking",
                "icon": "ticket",
                "text": "Book popular restaurants, observation decks, and Broadway shows ahead.",
            },
            {
                "category": "walking",
                "icon": "footprints",
                "text": "Wear comfortable shoes because daily walking distances add up quickly.",
            },
        ],
        "activities": [
            {
                "id": "central-park",
                "name": "Central Park",
                "category": "outdoor",
                "description": "Large park with walking routes, viewpoints, lawns, and museums nearby.",
                "duration_hours": 3,
                "cost_usd": 0,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild", "cloudy"],
            },
            {
                "id": "met-museum",
                "name": "The Met",
                "category": "museum",
                "description": "Major museum with art, antiquities, fashion, and rotating exhibits.",
                "duration_hours": 4,
                "cost_usd": 30,
                "weather_dependent": False,
                "best_weather": ["rain", "cold", "hot"],
            },
            {
                "id": "broadway-show",
                "name": "Broadway Show",
                "category": "nightlife",
                "description": "Evening theatre experience in Midtown.",
                "duration_hours": 3,
                "cost_usd": 120,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
        ],
    },
}


def normalize_city_key(city: str) -> str:
    return city.strip().lower()


def get_destination_tips_data(city: str) -> dict[str, Any]:
    city_key = normalize_city_key(city)
    if not city_key:
        raise ValueError("city must not be empty")

    if city_key not in DESTINATION_DATA:
        raise ValueError(f"No destination data for {city}")

    return DESTINATION_DATA[city_key]


def recommend_activities_data(city: str, weather: str = "", season: str = "") -> dict[str, Any]:
    destination = get_destination_tips_data(city)
    weather_key = weather.strip().lower() or "any"
    season_key = season.strip().lower()

    recommendations = []
    fallback = []
    for activity in destination["activities"]:
        best_weather = activity.get("best_weather", [])
        if "any" in best_weather:
            fallback.append(activity)
        elif weather_key in best_weather:
            recommendations.append(activity)
        elif not activity.get("weather_dependent"):
            fallback.append(activity)

    if not recommendations:
        recommendations = fallback or destination["activities"]

    return {
        "city": destination["city"],
        "weather": weather_key,
        "season": season_key,
        "activities": recommendations,
    }
