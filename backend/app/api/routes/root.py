from fastapi import APIRouter

router = APIRouter(tags=["meta"])


@router.get("")
async def api_root() -> dict[str, object]:
    """API index — documents the v1 base path and common routes."""
    return {
        "service": "ForecastOS API",
        "version": "0.1.0",
        "status": "ok",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/v1/health",
            "weather_search": "/api/v1/weather/search",
            "weather_suggestions": "/api/v1/weather/suggestions",
            "records": "/api/v1/records",
            "export": "/api/v1/export",
        },
    }
