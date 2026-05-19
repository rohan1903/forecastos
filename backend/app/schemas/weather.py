from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field, model_validator


class WeatherInputType(StrEnum):
    QUERY = "query"
    COORDINATES = "coordinates"


class WeatherSearchRequest(BaseModel):
    query: str | None = Field(default=None, min_length=1, max_length=120)
    input_type: WeatherInputType = WeatherInputType.QUERY
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    save: bool = False
    label: str | None = Field(default=None, max_length=80)
    notes: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_search_input(self) -> "WeatherSearchRequest":
        if self.input_type == WeatherInputType.COORDINATES:
            if self.latitude is None or self.longitude is None:
                raise ValueError("Latitude and longitude are required for coordinates.")
            return self

        if not self.query or not self.query.strip():
            raise ValueError("A location query is required.")

        return self


class LocationResponse(BaseModel):
    name: str
    country: str | None = None
    state: str | None = None
    latitude: float
    longitude: float


class CurrentWeatherResponse(BaseModel):
    temperature_c: float
    feels_like_c: float
    humidity: int
    pressure: int
    wind_speed: float
    visibility: int | None = None
    condition: str
    description: str
    icon: str | None = None
    sunrise: datetime | None = None
    sunset: datetime | None = None
    observed_at: datetime


class AirQualityResponse(BaseModel):
    aqi: int
    label: str
    components: dict[str, float]


class ForecastPointResponse(BaseModel):
    forecast_at: datetime
    temperature_c: float
    feels_like_c: float
    humidity: int
    wind_speed: float
    condition: str
    description: str
    icon: str | None = None
    precipitation_probability: float | None = None


class WeatherIntelligenceResponse(BaseModel):
    risk_score: int
    risk_level: str
    summary: str
    recommendations: list[str]
    clothing: str
    anomalies: list[str]


class WeatherSearchResponse(BaseModel):
    record_id: int | None = None
    location: LocationResponse
    current: CurrentWeatherResponse
    air_quality: AirQualityResponse
    forecast: list[ForecastPointResponse]
    intelligence: WeatherIntelligenceResponse
