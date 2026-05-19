from typing import Any

import httpx

from app.core.config import Settings
from app.core.errors import ForecastOSError


class OpenWeatherClient:
    def __init__(self, settings: Settings) -> None:
        self.api_key = settings.openweather_api_key
        self.timeout = settings.request_timeout_seconds
        self.weather_base_url = "https://api.openweathermap.org/data/2.5"
        self.geo_base_url = "https://api.openweathermap.org/geo/1.0"

    def _require_api_key(self) -> None:
        if not self.api_key:
            raise ForecastOSError(
                code="OPENWEATHER_API_KEY_MISSING",
                message="OpenWeatherMap API key is not configured.",
                status_code=500,
            )

    async def _get(self, url: str, params: dict[str, Any]) -> Any:
        self._require_api_key()
        request_params = {**params, "appid": self.api_key}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=request_params)
        except httpx.TimeoutException as exc:
            raise ForecastOSError(
                code="WEATHER_API_TIMEOUT",
                message="The weather provider timed out. Please try again.",
                status_code=504,
            ) from exc
        except httpx.HTTPError as exc:
            raise ForecastOSError(
                code="WEATHER_API_UNAVAILABLE",
                message="The weather provider could not be reached.",
                status_code=502,
            ) from exc

        if response.status_code == 401:
            provider_message = ""
            try:
                body = response.json()
                if isinstance(body, dict):
                    provider_message = str(body.get("message", "") or "").strip()
            except Exception:
                provider_message = ""

            detail = (
                f" OpenWeatherMap says: {provider_message}"
                if provider_message
                else ""
            )
            raise ForecastOSError(
                code="WEATHER_API_UNAUTHORIZED",
                message=(
                    "The configured weather API key was rejected."
                    + detail
                ).strip(),
                # Use 401 so logs and DevTools match “bad key”, not an infrastructure 502.
                status_code=401,
                details={
                    "provider_message": provider_message or None,
                    "provider_status": 401,
                },
            )

        if response.status_code == 404:
            raise ForecastOSError(
                code="LOCATION_NOT_FOUND",
                message="Could not find a matching location.",
                status_code=404,
                details={"provider_status": response.status_code},
            )

        if response.status_code == 429:
            raise ForecastOSError(
                code="WEATHER_API_RATE_LIMITED",
                message="The weather provider rate limit was reached. Please retry later.",
                status_code=429,
            )

        if response.status_code >= 400:
            provider_message = ""
            try:
                body = response.json()
                if isinstance(body, dict):
                    provider_message = str(body.get("message", "") or "").strip()
            except Exception:
                provider_message = ""

            details: dict[str, Any] = {"provider_status": response.status_code}
            if provider_message:
                details["provider_message"] = provider_message

            raise ForecastOSError(
                code="WEATHER_API_ERROR",
                message=(
                    "The weather provider returned an error."
                    + (f" OpenWeatherMap says: {provider_message}" if provider_message else "")
                ).strip(),
                status_code=502,
                details=details,
            )

        return response.json()

    async def geocode_query(self, query: str, limit: int = 1) -> list[dict[str, Any]]:
        return await self._get(
            f"{self.geo_base_url}/direct",
            {"q": query, "limit": limit},
        )

    async def reverse_geocode(
        self, latitude: float, longitude: float, limit: int = 1
    ) -> list[dict[str, Any]]:
        return await self._get(
            f"{self.geo_base_url}/reverse",
            {"lat": latitude, "lon": longitude, "limit": limit},
        )

    async def current_weather(self, latitude: float, longitude: float) -> dict[str, Any]:
        return await self._get(
            f"{self.weather_base_url}/weather",
            {"lat": latitude, "lon": longitude, "units": "metric"},
        )

    async def five_day_forecast(
        self, latitude: float, longitude: float
    ) -> dict[str, Any]:
        return await self._get(
            f"{self.weather_base_url}/forecast",
            {"lat": latitude, "lon": longitude, "units": "metric"},
        )

    async def air_quality(self, latitude: float, longitude: float) -> dict[str, Any]:
        return await self._get(
            f"{self.weather_base_url}/air_pollution",
            {"lat": latitude, "lon": longitude},
        )
