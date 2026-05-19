from app.schemas.weather import (
    AirQualityResponse,
    CurrentWeatherResponse,
    ForecastPointResponse,
    WeatherIntelligenceResponse,
)


def build_weather_intelligence(
    current: CurrentWeatherResponse,
    air_quality: AirQualityResponse,
    forecast: list[ForecastPointResponse],
) -> WeatherIntelligenceResponse:
    score = 0
    recommendations: list[str] = []
    anomalies: list[str] = []

    if current.temperature_c >= 35:
        score += 25
        recommendations.append("Plan outdoor activity outside peak afternoon heat.")
    elif current.temperature_c <= 5:
        score += 20
        recommendations.append("Wear insulated layers and limit prolonged exposure.")

    if current.feels_like_c - current.temperature_c >= 5:
        score += 10
        anomalies.append("Feels-like temperature is noticeably higher than actual temperature.")

    if current.wind_speed >= 10:
        score += 15
        recommendations.append("Secure loose outdoor items and expect windy conditions.")

    if current.visibility is not None and current.visibility < 5000:
        score += 15
        anomalies.append("Visibility is reduced enough to affect travel comfort.")

    if air_quality.aqi >= 4:
        score += 25
        recommendations.append("Reduce prolonged outdoor exposure due to poor air quality.")
    elif air_quality.aqi == 3:
        score += 12
        recommendations.append("Sensitive groups should monitor outdoor exposure.")

    rainy_periods = [
        point
        for point in forecast[:8]
        if "rain" in point.condition.lower()
        or "storm" in point.description.lower()
        or (point.precipitation_probability or 0) >= 0.6
    ]
    if rainy_periods:
        score += 15
        recommendations.append("Carry rain protection for the next forecast window.")

    risk_score = min(score, 100)
    risk_level = "low"
    if risk_score >= 70:
        risk_level = "high"
    elif risk_score >= 35:
        risk_level = "moderate"

    if not recommendations:
        recommendations.append("Conditions look manageable for normal outdoor plans.")

    clothing = "Comfortable everyday clothing"
    if current.temperature_c >= 30:
        clothing = "Light breathable clothing"
    elif current.temperature_c <= 12:
        clothing = "Warm layers"
    elif rainy_periods:
        clothing = "Light layers with rain protection"

    summary = (
        f"{current.description.title()} with {air_quality.label.lower()} air quality "
        f"and a {risk_level} planning risk."
    )

    return WeatherIntelligenceResponse(
        risk_score=risk_score,
        risk_level=risk_level,
        summary=summary,
        recommendations=recommendations,
        clothing=clothing,
        anomalies=anomalies,
    )
