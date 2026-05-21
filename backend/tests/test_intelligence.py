from datetime import UTC, datetime

from app.schemas.weather import (
    AirQualityResponse,
    CurrentWeatherResponse,
    ForecastPointResponse,
)
from app.services.intelligence_service import build_weather_intelligence


def _current(**overrides) -> CurrentWeatherResponse:
    base = {
        "temperature_c": 22.0,
        "feels_like_c": 22.0,
        "humidity": 50,
        "pressure": 1010,
        "wind_speed": 3.0,
        "visibility": 10000,
        "condition": "Clear",
        "description": "clear sky",
        "observed_at": datetime.now(UTC),
    }
    base.update(overrides)
    return CurrentWeatherResponse(**base)


def _air_quality(**overrides) -> AirQualityResponse:
    base = {"aqi": 1, "label": "Good", "components": {"pm2_5": 5.0}}
    base.update(overrides)
    return AirQualityResponse(**base)


def _forecast_point(**overrides) -> ForecastPointResponse:
    base = {
        "forecast_at": datetime.now(UTC),
        "temperature_c": 20.0,
        "feels_like_c": 20.0,
        "humidity": 55,
        "wind_speed": 2.0,
        "condition": "Clear",
        "description": "clear sky",
        "precipitation_probability": 0.1,
    }
    base.update(overrides)
    return ForecastPointResponse(**base)


def test_high_heat_raises_risk_score():
    result = build_weather_intelligence(
        _current(temperature_c=36.0),
        _air_quality(),
        [],
    )

    assert result.risk_score >= 25
    assert any("heat" in item.lower() for item in result.recommendations)


def test_poor_air_quality_adds_recommendation():
    result = build_weather_intelligence(
        _current(),
        _air_quality(aqi=4, label="Poor"),
        [],
    )

    assert result.risk_score >= 25
    assert any("air quality" in item.lower() for item in result.recommendations)


def test_rainy_forecast_adds_rain_recommendation():
    rainy = _forecast_point(
        condition="Rain",
        description="light rain",
        precipitation_probability=0.8,
    )
    result = build_weather_intelligence(_current(), _air_quality(), [rainy] * 3)

    assert any("rain" in item.lower() for item in result.recommendations)


def test_low_risk_baseline():
    result = build_weather_intelligence(
        _current(temperature_c=20.0, wind_speed=2.0),
        _air_quality(aqi=1),
        [],
    )

    assert result.risk_level == "low"
    assert result.risk_score < 35
    assert len(result.recommendations) >= 1
