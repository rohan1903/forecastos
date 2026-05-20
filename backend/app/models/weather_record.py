from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    query: Mapped[str] = mapped_column(String(120), nullable=False)
    input_type: Mapped[str] = mapped_column(String(32), nullable=False)
    resolved_name: Mapped[str] = mapped_column(String(120), nullable=False)
    country: Mapped[str | None] = mapped_column(String(8), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    date_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    label: Mapped[str | None] = mapped_column(String(80), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    temperature_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    feels_like_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pressure: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wind_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    visibility: Mapped[int | None] = mapped_column(Integer, nullable=True)
    condition: Mapped[str | None] = mapped_column(String(64), nullable=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sunrise: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sunset: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    aqi: Mapped[int | None] = mapped_column(Integer, nullable=True)
    aqi_label: Mapped[str | None] = mapped_column(String(32), nullable=True)
    risk_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    risk_level: Mapped[str | None] = mapped_column(String(32), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendations_json: Mapped[list | None] = mapped_column(JSON, nullable=True)
    forecast_json: Mapped[list | None] = mapped_column(JSON, nullable=True)
    raw_weather_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    raw_forecast_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    raw_aqi_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
