import asyncio
from datetime import UTC, datetime
from typing import Any

from app.clients.openweather_client import OpenWeatherClient
from app.core.errors import ForecastOSError
from app.schemas.weather import (
    AirQualityResponse,
    CurrentWeatherResponse,
    ForecastPointResponse,
    LocationResponse,
    WeatherInputType,
    WeatherSearchRequest,
    WeatherSearchResponse,
)
from app.services.intelligence_service import build_weather_intelligence


AQI_LABELS = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
}


class WeatherService:
    def __init__(self, client: OpenWeatherClient) -> None:
        self.client = client

    async def search(self, payload: WeatherSearchRequest) -> WeatherSearchResponse:
        location = await self._resolve_location(payload)

        current_raw, forecast_raw, aqi_raw = await asyncio.gather(
            self.client.current_weather(location.latitude, location.longitude),
            self.client.five_day_forecast(location.latitude, location.longitude),
            self.client.air_quality(location.latitude, location.longitude),
        )

        current = self._map_current_weather(current_raw)
        forecast = self._map_forecast(forecast_raw)
        air_quality = self._map_air_quality(aqi_raw)
        intelligence = build_weather_intelligence(current, air_quality, forecast)

        return WeatherSearchResponse(
            record_id=None,
            location=location,
            current=current,
            air_quality=air_quality,
            forecast=forecast,
            intelligence=intelligence,
        )

    async def _resolve_location(
        self, payload: WeatherSearchRequest
    ) -> LocationResponse:
        if payload.input_type == WeatherInputType.COORDINATES:
            assert payload.latitude is not None
            assert payload.longitude is not None
            reverse_results = await self.client.reverse_geocode(
                payload.latitude, payload.longitude
            )
            if reverse_results:
                result = reverse_results[0]
                return LocationResponse(
                    name=result.get("name") or "Current location",
                    country=result.get("country"),
                    state=result.get("state"),
                    latitude=payload.latitude,
                    longitude=payload.longitude,
                )

            return LocationResponse(
                name="Current location",
                latitude=payload.latitude,
                longitude=payload.longitude,
            )

        assert payload.query is not None
        geocode_results = await self.client.geocode_query(payload.query.strip())
        if not geocode_results:
            raise ForecastOSError(
                code="LOCATION_NOT_FOUND",
                message="Could not find a matching location.",
                status_code=404,
                details={"query": payload.query},
            )

        result = geocode_results[0]
        return LocationResponse(
            name=result.get("name") or payload.query,
            country=result.get("country"),
            state=result.get("state"),
            latitude=float(result["lat"]),
            longitude=float(result["lon"]),
        )

    def _map_current_weather(self, raw: dict[str, Any]) -> CurrentWeatherResponse:
        weather = (raw.get("weather") or [{}])[0]
        main = raw.get("main") or {}
        wind = raw.get("wind") or {}
        sys = raw.get("sys") or {}

        return CurrentWeatherResponse(
            temperature_c=round(float(main.get("temp", 0)), 1),
            feels_like_c=round(float(main.get("feels_like", 0)), 1),
            humidity=int(main.get("humidity", 0)),
            pressure=int(main.get("pressure", 0)),
            wind_speed=round(float(wind.get("speed", 0)), 1),
            visibility=raw.get("visibility"),
            condition=weather.get("main", "Unknown"),
            description=weather.get("description", "No description available"),
            icon=weather.get("icon"),
            sunrise=self._from_unix(sys.get("sunrise")),
            sunset=self._from_unix(sys.get("sunset")),
            observed_at=self._from_unix(raw.get("dt")) or datetime.now(UTC),
        )

    def _map_forecast(self, raw: dict[str, Any]) -> list[ForecastPointResponse]:
        points: list[ForecastPointResponse] = []
        for item in raw.get("list", []):
            weather = (item.get("weather") or [{}])[0]
            main = item.get("main") or {}
            wind = item.get("wind") or {}
            points.append(
                ForecastPointResponse(
                    forecast_at=self._from_unix(item.get("dt")) or datetime.now(UTC),
                    temperature_c=round(float(main.get("temp", 0)), 1),
                    feels_like_c=round(float(main.get("feels_like", 0)), 1),
                    humidity=int(main.get("humidity", 0)),
                    wind_speed=round(float(wind.get("speed", 0)), 1),
                    condition=weather.get("main", "Unknown"),
                    description=weather.get("description", "No description available"),
                    icon=weather.get("icon"),
                    precipitation_probability=item.get("pop"),
                )
            )

        return points

    def _map_air_quality(self, raw: dict[str, Any]) -> AirQualityResponse:
        first = (raw.get("list") or [{}])[0]
        main = first.get("main") or {}
        aqi = int(main.get("aqi", 0))

        return AirQualityResponse(
            aqi=aqi,
            label=AQI_LABELS.get(aqi, "Unknown"),
            components=first.get("components") or {},
        )

    def _from_unix(self, timestamp: int | float | None) -> datetime | None:
        if timestamp is None:
            return None

        return datetime.fromtimestamp(timestamp, tz=UTC)
