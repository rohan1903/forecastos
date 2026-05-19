from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class ForecastOSError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def error_response(
    code: str,
    message: str,
    status_code: int,
    details: dict[str, Any] | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": details or {},
            }
        },
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ForecastOSError)
    async def handle_forecastos_error(
        request: Request, exc: ForecastOSError
    ) -> JSONResponse:
        return error_response(exc.code, exc.message, exc.status_code, exc.details)
