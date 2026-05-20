from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator


class RecordUpdateRequest(BaseModel):
    label: str | None = Field(default=None, max_length=80)
    notes: str | None = Field(default=None, max_length=500)
    date_start: date | None = None
    date_end: date | None = None

    @model_validator(mode="after")
    def validate_date_range(self) -> "RecordUpdateRequest":
        if self.date_start and self.date_end and self.date_start > self.date_end:
            raise ValueError("date_start must be on or before date_end.")
        return self


class RecordResponse(BaseModel):
    id: int
    query: str
    input_type: str
    resolved_name: str
    country: str | None = None
    latitude: float
    longitude: float
    date_start: date | None = None
    date_end: date | None = None
    label: str | None = None
    notes: str | None = None
    temperature_c: float | None = None
    feels_like_c: float | None = None
    humidity: int | None = None
    pressure: int | None = None
    wind_speed: float | None = None
    visibility: int | None = None
    condition: str | None = None
    description: str | None = None
    sunrise: datetime | None = None
    sunset: datetime | None = None
    aqi: int | None = None
    aqi_label: str | None = None
    risk_score: int | None = None
    risk_level: str | None = None
    summary: str | None = None
    recommendations: list[str] = Field(default_factory=list)
    forecast: list[dict] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RecordListResponse(BaseModel):
    items: list[RecordResponse]
    total: int
    skip: int
    limit: int
