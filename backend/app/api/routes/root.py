def build_api_root_response() -> dict[str, object]:
    """Payload for GET /api/v1 — API index and common route paths."""
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
