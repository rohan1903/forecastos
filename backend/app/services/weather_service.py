import asyncio
from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.clients.nominatim_client import NominatimClient
from app.clients.openweather_client import OpenWeatherClient
from app.core.errors import ForecastOSError
from app.schemas.weather import (
    AirQualityResponse,
    CurrentWeatherResponse,
    ForecastPointResponse,
    LocationResponse,
    LocationSuggestion,
    LocationSuggestionsResponse,
    WeatherInputType,
    WeatherSearchRequest,
    WeatherSearchResponse,
)
from app.services.intelligence_service import build_weather_intelligence
from app.services.record_service import create_from_weather_search


AQI_LABELS = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
}

COUNTRY_CODE_NAMES = {
    "IN": "India",
    "US": "United States",
    "USA": "United States",
    "UK": "United Kingdom",
    "GB": "United Kingdom",
    "CA": "Canada",
    "AU": "Australia",
    "DE": "Germany",
    "FR": "France",
    "JP": "Japan",
    "BR": "Brazil",
    "MX": "Mexico",
}


class WeatherService:
    def __init__(
        self, client: OpenWeatherClient, nominatim: NominatimClient | None = None
    ) -> None:
        self.client = client
        self.nominatim = nominatim

    async def search(
        self, payload: WeatherSearchRequest, db: Session | None = None
    ) -> WeatherSearchResponse:
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

        record_id = None
        if payload.save and db is not None:
            saved = create_from_weather_search(
                db,
                payload,
                location,
                current,
                air_quality,
                forecast,
                intelligence,
                raw_snapshots={
                    "current": current_raw,
                    "forecast": forecast_raw,
                    "aqi": aqi_raw,
                },
            )
            record_id = saved.id

        return WeatherSearchResponse(
            record_id=record_id,
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
        query = payload.query.strip()

        if self._is_country_qualified_query(query):
            nominatim_location = await self._resolve_location_from_nominatim(query)
            if nominatim_location is not None:
                return nominatim_location

        for variant in self._query_variants(query):
            geocode_results: list[dict[str, Any]] = []
            try:
                geocode_results = await self.client.geocode_query(variant)
            except ForecastOSError as exc:
                if exc.code != "LOCATION_NOT_FOUND":
                    raise

            if geocode_results:
                result = self._pick_best_geocode_result(query, geocode_results)
                if result is not None:
                    return self._location_from_geocode(result, query)

        nominatim_location = await self._resolve_location_from_nominatim(query)
        if nominatim_location is not None:
            return nominatim_location

        return await self._resolve_location_from_weather_query(query)

    async def get_location_suggestions(
        self, query: str, limit: int = 8
    ) -> LocationSuggestionsResponse:
        trimmed = query.strip()
        if len(trimmed) < 2:
            return LocationSuggestionsResponse(query=trimmed, suggestions=[])

        suggestions: list[LocationSuggestion] = []
        seen: set[tuple[float, float]] = set()

        def add_suggestion(item: LocationSuggestion) -> None:
            if len(suggestions) >= limit:
                return
            key = (round(item.latitude, 3), round(item.longitude, 3))
            if key in seen:
                return
            seen.add(key)
            suggestions.append(item)

        state_level_match = False
        if self.nominatim is not None:
            nominatim_results = await self.nominatim.search(
                self._to_nominatim_query(trimmed), limit=limit
            )
            target = trimmed.split(",")[0].strip().lower()
            for result in nominatim_results:
                if not self._is_useful_nominatim_result(result):
                    continue

                if self._is_country_qualified_query(trimmed):
                    name = str(result.get("name", "")).lower()
                    if result.get("addresstype") == "state" and name == target:
                        state_level_match = True
                        add_suggestion(self._suggestion_from_nominatim(result))
                        continue
                    if state_level_match:
                        continue

                add_suggestion(self._suggestion_from_nominatim(result))

        for variant in self._query_variants(trimmed):
            if len(suggestions) >= limit:
                break
            try:
                geocode_results = await self.client.geocode_query(variant, limit=limit)
            except ForecastOSError:
                geocode_results = []

            for result in geocode_results:
                if state_level_match and self._is_country_qualified_query(trimmed):
                    parts = [p.strip().lower() for p in trimmed.split(",") if p.strip()]
                    if str(result.get("state", "")).lower() != parts[0]:
                        continue
                if self._geocode_matches_query(trimmed, result):
                    add_suggestion(self._suggestion_from_geocode(result, trimmed))

        return LocationSuggestionsResponse(query=trimmed, suggestions=suggestions)

    def _query_variants(self, query: str) -> list[str]:
        trimmed = query.strip()
        variants: list[str] = []
        if trimmed:
            variants.append(trimmed)

        compact = ",".join(part.strip() for part in trimmed.split(",") if part.strip())
        if compact and compact not in variants:
            variants.append(compact)

        nominatim_query = self._to_nominatim_query(trimmed)
        if nominatim_query and nominatim_query not in variants:
            variants.append(nominatim_query)

        return variants

    def _to_nominatim_query(self, query: str) -> str:
        parts = [part.strip() for part in query.split(",") if part.strip()]
        if not parts:
            return query.strip()

        if len(parts) >= 2 and len(parts[-1]) <= 3:
            country_key = parts[-1].upper()
            country_name = COUNTRY_CODE_NAMES.get(country_key)
            if country_name:
                parts[-1] = country_name

        return ", ".join(parts)

    def _is_useful_nominatim_result(self, result: dict[str, Any]) -> bool:
        place_type = result.get("type", "")
        place_class = result.get("class", "")
        addresstype = result.get("addresstype", "")
        if addresstype in {"state", "region", "county", "city", "town", "village"}:
            return True
        if place_class == "boundary" and place_type == "administrative":
            return True
        if place_class == "place":
            return True
        return False

    def _suggestion_from_nominatim(self, result: dict[str, Any]) -> LocationSuggestion:
        address = result.get("address") or {}
        country = address.get("country_code", "").upper() or None
        if not country and address.get("country"):
            country = str(address.get("country"))[:2].upper()

        display = str(result.get("display_name") or result.get("name") or "Unknown")
        if len(display) > 80:
            display = ", ".join(display.split(",")[:3])

        return LocationSuggestion(
            name=str(result.get("name") or display.split(",")[0]),
            country=country,
            state=address.get("state"),
            latitude=float(result["lat"]),
            longitude=float(result["lon"]),
            display_label=display,
        )

    def _suggestion_from_geocode(
        self, result: dict[str, Any], fallback_name: str
    ) -> LocationSuggestion:
        return LocationSuggestion(
            name=result.get("name") or fallback_name,
            country=result.get("country"),
            state=result.get("state"),
            latitude=float(result["lat"]),
            longitude=float(result["lon"]),
            display_label=self._format_suggestion_label(result),
        )

    def _pick_best_geocode_result(
        self, query: str, results: list[dict[str, Any]]
    ) -> dict[str, Any] | None:
        if not results:
            return None

        for result in results:
            if self._geocode_matches_query(query, result):
                return result

        parts = [part.strip().lower() for part in query.split(",") if part.strip()]
        if len(parts) == 1:
            return results[0]

        return None

    def _is_country_qualified_query(self, query: str) -> bool:
        parts = [part.strip() for part in query.split(",") if part.strip()]
        return (
            len(parts) == 2
            and len(parts[-1]) <= 3
            and parts[-1].replace(".", "").isalpha()
        )

    def _geocode_matches_query(self, query: str, result: dict[str, Any]) -> bool:
        parts = [part.strip().lower() for part in query.split(",") if part.strip()]
        if not parts:
            return True

        target = parts[0]
        name = str(result.get("name", "")).lower()
        state = str(result.get("state", "")).lower()

        if self._is_country_qualified_query(query):
            country = str(result.get("country", "")).upper()
            if country != parts[-1].upper():
                return False
            if state == target:
                return True
            if name == target and len(target) > 4:
                return True
            return False

        return target in {name, state} or target in name

    def _location_from_geocode(
        self, result: dict[str, Any], fallback_name: str
    ) -> LocationResponse:
        return LocationResponse(
            name=result.get("name") or fallback_name,
            country=result.get("country"),
            state=result.get("state"),
            latitude=float(result["lat"]),
            longitude=float(result["lon"]),
        )

    async def _resolve_location_from_nominatim(
        self, query: str
    ) -> LocationResponse | None:
        if self.nominatim is None:
            return None

        results = await self.nominatim.search(self._to_nominatim_query(query), limit=5)
        for result in results:
            if not self._is_useful_nominatim_result(result):
                continue
            suggestion = self._suggestion_from_nominatim(result)
            return LocationResponse(
                name=suggestion.name,
                country=suggestion.country,
                state=suggestion.state,
                latitude=suggestion.latitude,
                longitude=suggestion.longitude,
            )

        return None

    def _format_suggestion_label(self, result: dict[str, Any]) -> str:
        parts: list[str] = []
        name = result.get("name")
        if name:
            parts.append(str(name))
        state = result.get("state")
        if state:
            parts.append(str(state))
        country = result.get("country")
        if country:
            parts.append(str(country))
        return ", ".join(parts) if parts else "Unknown location"

    async def _resolve_location_from_weather_query(
        self, query: str
    ) -> LocationResponse:
        """Fallback when Geocoding API is unavailable or returns no matches."""
        try:
            raw = await self.client.current_weather_by_query(query)
        except ForecastOSError as exc:
            if exc.code == "LOCATION_NOT_FOUND":
                raise ForecastOSError(
                    code="LOCATION_NOT_FOUND",
                    message="Could not find a matching location.",
                    status_code=404,
                    details={"query": query},
                ) from exc
            raise

        coord = raw.get("coord") or {}
        sys = raw.get("sys") or {}
        return LocationResponse(
            name=raw.get("name") or query,
            country=sys.get("country"),
            state=None,
            latitude=float(coord["lat"]),
            longitude=float(coord["lon"]),
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
