from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.clients.nominatim_client import NominatimClient
from app.clients.openweather_client import OpenWeatherClient
from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.schemas.weather import (
    LocationSuggestionsResponse,
    WeatherSearchRequest,
    WeatherSearchResponse,
)
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["weather"])


def get_weather_service(settings: Settings = Depends(get_settings)) -> WeatherService:
    return WeatherService(OpenWeatherClient(settings), NominatimClient(settings))


@router.get("/suggestions", response_model=LocationSuggestionsResponse)
async def location_suggestions(
    q: str = Query(min_length=2, max_length=120),
    limit: int = Query(default=8, ge=1, le=10),
    service: WeatherService = Depends(get_weather_service),
) -> LocationSuggestionsResponse:
    return await service.get_location_suggestions(q, limit=limit)


@router.post("/search", response_model=WeatherSearchResponse)
async def search_weather(
    payload: WeatherSearchRequest,
    db: Session = Depends(get_db),
    service: WeatherService = Depends(get_weather_service),
) -> WeatherSearchResponse:
    return await service.search(payload, db=db)
