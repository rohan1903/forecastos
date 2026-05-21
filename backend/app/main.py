from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import export, health, records, weather
from app.api.routes.root import build_api_root_response
from app.core.config import get_settings
from app.core.database import init_db
from app.core.errors import register_error_handlers


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="Backend API for ForecastOS weather intelligence.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_error_handlers(app)

    @app.get(settings.api_v1_prefix, tags=["meta"], summary="API index")
    async def api_v1_root() -> dict[str, object]:
        return build_api_root_response()

    app.include_router(health.router, prefix=settings.api_v1_prefix)
    app.include_router(weather.router, prefix=settings.api_v1_prefix)
    app.include_router(records.router, prefix=settings.api_v1_prefix)
    app.include_router(export.router, prefix=settings.api_v1_prefix)

    return app


app = create_app()
