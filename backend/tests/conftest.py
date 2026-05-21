import os
import tempfile
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

_test_db_path = os.path.join(tempfile.gettempdir(), "forecastos_pytest.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_test_db_path}"
os.environ.setdefault("OPENWEATHER_API_KEY", "test-key-not-used")

from app.core.database import SessionLocal, init_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.weather_record import WeatherRecord  # noqa: E402


def _clear_weather_records() -> None:
    session = SessionLocal()
    try:
        session.query(WeatherRecord).delete()
        session.commit()
    finally:
        session.close()


@pytest.fixture(autouse=True)
def _isolate_database() -> Generator[None, None, None]:
    init_db()
    _clear_weather_records()
    yield
    _clear_weather_records()


@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    init_db()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def seeded_record(db: Session) -> WeatherRecord:
    record = WeatherRecord(
        query="London, UK",
        input_type="query",
        resolved_name="London",
        country="GB",
        latitude=51.5074,
        longitude=-0.1278,
        label="Trip planning",
        notes="Check rain",
        temperature_c=18.0,
        feels_like_c=17.0,
        humidity=65,
        pressure=1012,
        wind_speed=4.5,
        condition="Clouds",
        description="overcast clouds",
        aqi=2,
        aqi_label="Fair",
        risk_score=15,
        risk_level="low",
        summary="Overcast with fair air quality and a low planning risk.",
        recommendations_json=["Conditions look manageable for normal outdoor plans."],
        forecast_json=[],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
