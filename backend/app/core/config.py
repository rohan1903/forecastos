from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/core/config.py -> parents[2] == backend/ (always, regardless of CWD)
_BACKEND_DIR = Path(__file__).resolve().parents[2]
_ENV_FILE = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "ForecastOS API"
    api_v1_prefix: str = "/api/v1"
    openweather_api_key: str = ""
    backend_cors_origins: str = "http://localhost:3000"
    request_timeout_seconds: float = 12.0

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("openweather_api_key", mode="before")
    @classmethod
    def strip_api_key(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.backend_cors_origins.split(",")
            if origin.strip()
        ]


def get_settings() -> Settings:
    """Fresh settings each call so edits to backend/.env apply without stale lru_cache."""
    return Settings()
