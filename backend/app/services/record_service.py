from typing import Any

from sqlalchemy.orm import Session

from app.core.errors import ForecastOSError
from app.models.weather_record import WeatherRecord
from app.schemas.records import RecordResponse, RecordUpdateRequest
from app.schemas.weather import (
    AirQualityResponse,
    CurrentWeatherResponse,
    ForecastPointResponse,
    LocationResponse,
    WeatherInputType,
    WeatherIntelligenceResponse,
    WeatherSearchRequest,
)


def record_to_response(record: WeatherRecord) -> RecordResponse:
    return RecordResponse(
        id=record.id,
        query=record.query,
        input_type=record.input_type,
        resolved_name=record.resolved_name,
        country=record.country,
        latitude=record.latitude,
        longitude=record.longitude,
        date_start=record.date_start,
        date_end=record.date_end,
        label=record.label,
        notes=record.notes,
        temperature_c=record.temperature_c,
        feels_like_c=record.feels_like_c,
        humidity=record.humidity,
        pressure=record.pressure,
        wind_speed=record.wind_speed,
        visibility=record.visibility,
        condition=record.condition,
        description=record.description,
        sunrise=record.sunrise,
        sunset=record.sunset,
        aqi=record.aqi,
        aqi_label=record.aqi_label,
        risk_score=record.risk_score,
        risk_level=record.risk_level,
        summary=record.summary,
        recommendations=record.recommendations_json or [],
        forecast=record.forecast_json or [],
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


def create_from_weather_search(
    db: Session,
    payload: WeatherSearchRequest,
    location: LocationResponse,
    current: CurrentWeatherResponse,
    air_quality: AirQualityResponse,
    forecast: list[ForecastPointResponse],
    intelligence: WeatherIntelligenceResponse,
    raw_snapshots: dict[str, Any],
) -> WeatherRecord:
    query_text = payload.query or f"{location.latitude},{location.longitude}"
    record = WeatherRecord(
        query=query_text,
        input_type=payload.input_type.value
        if isinstance(payload.input_type, WeatherInputType)
        else str(payload.input_type),
        resolved_name=location.name,
        country=location.country,
        latitude=location.latitude,
        longitude=location.longitude,
        label=payload.label,
        notes=payload.notes,
        temperature_c=current.temperature_c,
        feels_like_c=current.feels_like_c,
        humidity=current.humidity,
        pressure=current.pressure,
        wind_speed=current.wind_speed,
        visibility=current.visibility,
        condition=current.condition,
        description=current.description,
        sunrise=current.sunrise,
        sunset=current.sunset,
        aqi=air_quality.aqi,
        aqi_label=air_quality.label,
        risk_score=intelligence.risk_score,
        risk_level=intelligence.risk_level,
        summary=intelligence.summary,
        recommendations_json=intelligence.recommendations,
        forecast_json=[point.model_dump(mode="json") for point in forecast],
        raw_weather_json=raw_snapshots.get("current"),
        raw_forecast_json=raw_snapshots.get("forecast"),
        raw_aqi_json=raw_snapshots.get("aqi"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_records(db: Session, skip: int = 0, limit: int = 20) -> tuple[list[WeatherRecord], int]:
    total = db.query(WeatherRecord).count()
    items = (
        db.query(WeatherRecord)
        .order_by(WeatherRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


def get_record(db: Session, record_id: int) -> WeatherRecord:
    record = db.get(WeatherRecord, record_id)
    if record is None:
        raise ForecastOSError(
            code="RECORD_NOT_FOUND",
            message="Saved weather record not found.",
            status_code=404,
            details={"record_id": record_id},
        )
    return record


def update_record(
    db: Session, record_id: int, patch: RecordUpdateRequest
) -> WeatherRecord:
    record = get_record(db, record_id)
    updates = patch.model_dump(exclude_unset=True)
    if "date_start" in updates or "date_end" in updates:
        date_start = updates.get("date_start", record.date_start)
        date_end = updates.get("date_end", record.date_end)
        if date_start and date_end and date_start > date_end:
            raise ForecastOSError(
                code="INVALID_DATE_RANGE",
                message="date_start must be on or before date_end.",
                status_code=400,
            )
    for key, value in updates.items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record


def delete_record(db: Session, record_id: int) -> None:
    record = get_record(db, record_id)
    db.delete(record)
    db.commit()
