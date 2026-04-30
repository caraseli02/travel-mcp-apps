from fastapi import APIRouter, Depends, status

from app.config import Settings, get_settings
from app.models import TravelPlanRequest, TravelPlanResponse
from mcp_clients.base_client import MCPClientError
from mcp_clients.packing_client import PackingClient
from mcp_clients.travel_client import TravelTipsClient
from mcp_clients.weather_client import WeatherClient

router = APIRouter()


@router.post("/plan", response_model=TravelPlanResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_travel_plan(
    request: TravelPlanRequest,
    settings: Settings = Depends(get_settings),
) -> TravelPlanResponse:
    duration_days = (request.end_date - request.start_date).days + 1
    weather_client = WeatherClient(str(settings.weather_mcp_url))
    travel_client = TravelTipsClient(str(settings.travel_tips_mcp_url))
    packing_client = PackingClient(str(settings.packing_mcp_url))

    plan = {
        "origin_city": request.origin_city,
        "destination_city": request.destination_city,
        "duration_days": duration_days,
    }
    errors: dict[str, str] = {}

    try:
        forecast = await weather_client.get_forecast(request.destination_city, min(duration_days, 5))
        plan["weather_forecast"] = forecast
    except (MCPClientError, ValueError) as exc:
        forecast = None
        errors["weather"] = str(exc)

    try:
        destination_tips = await travel_client.get_destination_tips(request.destination_city)
        plan["destination_tips"] = destination_tips
    except (MCPClientError, ValueError) as exc:
        errors["travel_tips"] = str(exc)

    try:
        if forecast is None:
            raise ValueError("Weather forecast unavailable")
        packing_list = await packing_client.generate_packing_list(
            request.destination_city,
            duration_days,
            forecast,
        )
        plan["packing_list"] = packing_list
    except (MCPClientError, ValueError) as exc:
        errors["packing"] = str(exc)

    response_status = "partial" if errors else "complete"
    message = "Travel plan generated" if not errors else "Travel plan generated with partial MCP data"

    return TravelPlanResponse(
        status=response_status,
        message=message,
        plan=plan,
        errors=errors,
    )
