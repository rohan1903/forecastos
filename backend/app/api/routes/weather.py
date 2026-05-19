from fastapi import APIRouter, Depends

from app.clients.openweather_client import OpenWeatherClient
from app.core.config import Settings, get_settings
from app.schemas.weather import WeatherSearchRequest, WeatherSearchResponse
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["weather"])


def get_weather_service(settings: Settings = Depends(get_settings)) -> WeatherService:
    return WeatherService(OpenWeatherClient(settings))


@router.post("/search", response_model=WeatherSearchResponse)
async def search_weather(
    payload: WeatherSearchRequest,
    service: WeatherService = Depends(get_weather_service),
) -> WeatherSearchResponse:
    return await service.search(payload)
