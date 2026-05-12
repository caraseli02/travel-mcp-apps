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
    "rome": {
        "city": "Rome",
        "country": "Italy",
        "overview": "An open-air museum of ancient ruins, Renaissance art, piazzas, fountains, and some of the best food in Europe.",
        "best_time": "April-June, September-October",
        "coordinates": {"lat": 41.9028, "lon": 12.4964},
        "tips": [
            {
                "category": "booking",
                "icon": "ticket",
                "text": "Book Vatican Museums and Colosseum tickets at least 2 weeks ahead to skip long queues.",
            },
            {
                "category": "transportation",
                "icon": "train",
                "text": "Use the metro for cross-city hops. Most historic center is walkable.",
            },
            {
                "category": "food",
                "icon": "utensils",
                "text": "Avoid restaurants right next to major tourist sites — walk a few blocks for better food at half the price.",
            },
            {
                "category": "culture",
                "icon": "church",
                "text": "Cover shoulders and knees when visiting churches (St. Peter's enforces this strictly).",
            },
            {
                "category": "water",
                "icon": "droplet",
                "text": "Fill water bottles at the free nasone (water fountains) found throughout the city.",
            },
        ],
        "activities": [
            {
                "id": "colosseum",
                "name": "Colosseum & Roman Forum",
                "category": "landmark",
                "description": "Iconic ancient amphitheater and adjacent ruins. Book underground tour for full experience.",
                "duration_hours": 3,
                "cost_usd": 25,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild", "cloudy"],
            },
            {
                "id": "vatican-museums",
                "name": "Vatican Museums & Sistine Chapel",
                "category": "museum",
                "description": "Vast art collection ending in Michelangelo's Sistine Chapel ceiling.",
                "duration_hours": 4,
                "cost_usd": 20,
                "weather_dependent": False,
                "best_weather": ["rain", "hot", "cold"],
            },
            {
                "id": "trastevere-food",
                "name": "Trastevere Food Walk",
                "category": "food",
                "description": "Evening stroll through Trastevere's cobbled streets for cacio e pepe, supplì, and gelato.",
                "duration_hours": 3,
                "cost_usd": 40,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
            {
                "id": "borghese-gallery",
                "name": "Borghese Gallery & Gardens",
                "category": "museum",
                "description": "World-class art in a villa setting surrounded by a peaceful park. Timed entry required.",
                "duration_hours": 2,
                "cost_usd": 15,
                "weather_dependent": False,
                "best_weather": ["rain", "hot", "cold"],
            },
            {
                "id": "pantheon-piazza",
                "name": "Pantheon & Historic Piazzas",
                "category": "landmark",
                "description": "Walk from Pantheon to Piazza Navona to Trevi Fountain — the classic Rome stroll.",
                "duration_hours": 2,
                "cost_usd": 0,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild", "cloudy"],
            },
        ],
    },
    "barcelona": {
        "city": "Barcelona",
        "country": "Spain",
        "overview": "A vibrant coastal city mixing Gaudi architecture, beaches, tapas bars, and lively neighborhood life.",
        "best_time": "May-June, September-October",
        "coordinates": {"lat": 41.3874, "lon": 2.1686},
        "tips": [
            {
                "category": "booking",
                "icon": "ticket",
                "text": "Book Sagrada Familia and Park Guell tickets days ahead — they sell out.",
            },
            {
                "category": "safety",
                "icon": "shield",
                "text": "Watch for pickpockets on La Rambla and in the metro, especially in tourist season.",
            },
            {
                "category": "food",
                "icon": "utensils",
                "text": "Eat tapas in El Born or Gracia, not on La Rambla.",
            },
        ],
        "activities": [
            {
                "id": "sagrada-familia",
                "name": "Sagrada Familia",
                "category": "landmark",
                "description": "Gaudi's unfinished masterpiece basilica. Book tower access for city views.",
                "duration_hours": 2,
                "cost_usd": 30,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
            {
                "id": "park-guell",
                "name": "Park Guell",
                "category": "outdoor",
                "description": "Colorful Gaudi mosaic park with panoramic city views.",
                "duration_hours": 2,
                "cost_usd": 12,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild"],
            },
            {
                "id": "gothic-quarter",
                "name": "Gothic Quarter Walk",
                "category": "neighborhood",
                "description": "Medieval alleys, hidden plazas, and ancient Roman walls.",
                "duration_hours": 2,
                "cost_usd": 0,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
        ],
    },
    "berlin": {
        "city": "Berlin",
        "country": "Germany",
        "overview": "A creative capital known for museums, nightlife, street art, history, and green spaces.",
        "best_time": "May-September",
        "coordinates": {"lat": 52.5200, "lon": 13.4050},
        "tips": [
            {
                "category": "transportation",
                "icon": "train",
                "text": "Get a day ticket for U-Bahn and S-Bahn — covers most of the city.",
            },
            {
                "category": "culture",
                "icon": "clock",
                "text": "Berlin runs late — clubs open after midnight, brunch starts at noon.",
            },
            {
                "category": "cash",
                "icon": "banknote",
                "text": "Many places still prefer cash, keep some euros handy.",
            },
        ],
        "activities": [
            {
                "id": "museum-island",
                "name": "Museum Island",
                "category": "museum",
                "description": "UNESCO complex with five world-class museums on a single island.",
                "duration_hours": 4,
                "cost_usd": 20,
                "weather_dependent": False,
                "best_weather": ["rain", "cold", "hot"],
            },
            {
                "id": "east-side-gallery",
                "name": "East Side Gallery",
                "category": "landmark",
                "description": "1.3km stretch of Berlin Wall covered in murals along the Spree.",
                "duration_hours": 1,
                "cost_usd": 0,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild", "cloudy"],
            },
            {
                "id": "tiergarten",
                "name": "Tiergarten",
                "category": "outdoor",
                "description": "Large central park for walks, picnics, and bike rides.",
                "duration_hours": 2,
                "cost_usd": 0,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild"],
            },
        ],
    },
    "amsterdam": {
        "city": "Amsterdam",
        "country": "Netherlands",
        "overview": "A canal-lined city of museums, bicycles, brown cafes, and narrow gabled houses.",
        "best_time": "April-May, September-October",
        "coordinates": {"lat": 52.3676, "lon": 4.9041},
        "tips": [
            {
                "category": "transportation",
                "icon": "bike",
                "text": "Rent a bike — it's the fastest way to get around and very safe.",
            },
            {
                "category": "booking",
                "icon": "ticket",
                "text": "Book Anne Frank House tickets weeks ahead — they release in batches.",
            },
            {
                "category": "walking",
                "icon": "map",
                "text": "Watch for bikes at every intersection — they always have right of way.",
            },
        ],
        "activities": [
            {
                "id": "rijksmuseum",
                "name": "Rijksmuseum",
                "category": "museum",
                "description": "Dutch masters including Rembrandt's Night Watch.",
                "duration_hours": 3,
                "cost_usd": 22,
                "weather_dependent": False,
                "best_weather": ["rain", "cold", "hot"],
            },
            {
                "id": "canal-cruise",
                "name": "Canal Cruise",
                "category": "outdoor",
                "description": "See the city from the water — book a small boat tour for the best experience.",
                "duration_hours": 1,
                "cost_usd": 18,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild", "cloudy"],
            },
            {
                "id": "jordaan-walk",
                "name": "Jordaan Neighborhood",
                "category": "neighborhood",
                "description": "Charming area with galleries, vintage shops, and cozy cafes.",
                "duration_hours": 2,
                "cost_usd": 0,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
        ],
    },
    "lisbon": {
        "city": "Lisbon",
        "country": "Portugal",
        "overview": "A hilly coastal city with pastel buildings, cobblestone streets, pasteis de nata, and Atlantic light.",
        "best_time": "March-June, September-November",
        "coordinates": {"lat": 38.7223, "lon": -9.1393},
        "tips": [
            {
                "category": "transportation",
                "icon": "train",
                "text": "Use tram 28 for a scenic ride, but take the metro for actual commuting.",
            },
            {
                "category": "walking",
                "icon": "footprints",
                "text": "Wear good shoes — the cobblestones and hills are tough on flat sandals.",
            },
            {
                "category": "food",
                "icon": "utensils",
                "text": "Try pasteis de nata at Pasteis de Belem and fresh grilled sardines in season.",
            },
        ],
        "activities": [
            {
                "id": "belem-tower",
                "name": "Belem Tower & Jeronimos Monastery",
                "category": "landmark",
                "description": "UNESCO sites celebrating Portugal's Age of Discovery.",
                "duration_hours": 2,
                "cost_usd": 12,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild"],
            },
            {
                "id": "alfama",
                "name": "Alfama Neighborhood",
                "category": "neighborhood",
                "description": "Oldest district with fado bars, viewpoints, and winding alleys.",
                "duration_hours": 3,
                "cost_usd": 0,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
            {
                "id": "time-out-market",
                "name": "Time Out Market",
                "category": "food",
                "description": "Gourmet food hall showcasing Lisbon's best chefs and vendors.",
                "duration_hours": 2,
                "cost_usd": 30,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
        ],
    },
    "athens": {
        "city": "Athens",
        "country": "Greece",
        "overview": "An ancient city layered with ruins, lively neighborhoods, great food, and nearby islands.",
        "best_time": "April-May, September-October",
        "coordinates": {"lat": 37.9838, "lon": 23.7275},
        "tips": [
            {
                "category": "timing",
                "icon": "sun",
                "text": "Visit the Acropolis early morning or late afternoon to avoid peak heat and crowds.",
            },
            {
                "category": "transportation",
                "icon": "train",
                "text": "The metro is clean and efficient. Walk in the center, metro for longer hops.",
            },
            {
                "category": "food",
                "icon": "utensils",
                "text": "Seek out neighborhood tavernas in Psyrri or Exarcheia for authentic food.",
            },
        ],
        "activities": [
            {
                "id": "acropolis",
                "name": "Acropolis & Parthenon",
                "category": "landmark",
                "description": "The essential Athens visit — ancient hilltop temple with sweeping city views.",
                "duration_hours": 3,
                "cost_usd": 22,
                "weather_dependent": True,
                "best_weather": ["sunny", "mild", "cloudy"],
            },
            {
                "id": "plaka-walk",
                "name": "Plaka & Monastiraki",
                "category": "neighborhood",
                "description": "Historic neighborhood below the Acropolis with shops, cafes, and ruins.",
                "duration_hours": 2,
                "cost_usd": 0,
                "weather_dependent": False,
                "best_weather": ["any"],
            },
            {
                "id": "national-archaeological",
                "name": "National Archaeological Museum",
                "category": "museum",
                "description": "World's finest collection of ancient Greek artifacts.",
                "duration_hours": 3,
                "cost_usd": 12,
                "weather_dependent": False,
                "best_weather": ["rain", "hot", "cold"],
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
        # Fallback: return a generic response instead of erroring
        return {
            "city": city.strip().title(),
            "country": "",
            "overview": f"{city.strip().title()} is not yet in our curated destination guide. Ask ChatGPT for local tips, must-see attractions, and restaurant recommendations.",
            "best_time": "Check climate data for your travel dates.",
            "coordinates": {},
            "tips": [
                {"category": "general", "icon": "lightbulb", "text": f"Ask about local customs, transportation, and food recommendations for {city.strip().title()}."},
                {"category": "booking", "icon": "ticket", "text": "Book major attractions and popular restaurants in advance."},
                {"category": "safety", "icon": "shield", "text": "Research local safety tips and common tourist scams before your trip."},
            ],
            "activities": [],
            "_fallback": True,
        }

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
