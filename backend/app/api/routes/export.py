import json
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import ForecastOSError
from app.schemas.export import ExportFormat
from app.services.export_service import (
    export_records_csv,
    export_records_json,
    export_records_markdown,
)
from app.services.record_service import get_record, list_records

router = APIRouter(tags=["export"])


def _records_for_export(db: Session, record_id: int | None, skip: int, limit: int):
    if record_id is not None:
        return [get_record(db, record_id)]
    items, _ = list_records(db, skip=skip, limit=limit)
    return items


@router.get("/export")
def export_all_records(
    format: ExportFormat = Query(alias="format"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=500),
    db: Session = Depends(get_db),
) -> Response:
    records = _records_for_export(db, record_id=None, skip=skip, limit=limit)
    return _build_export_response(records, format, filename_prefix="forecastos-records")


@router.get("/records/{record_id}/export")
def export_single_record(
    record_id: int,
    format: ExportFormat = Query(alias="format"),
    db: Session = Depends(get_db),
) -> Response:
    records = _records_for_export(db, record_id=record_id, skip=0, limit=1)
    return _build_export_response(
        records, format, filename_prefix=f"forecastos-record-{record_id}"
    )


def _build_export_response(records, format: ExportFormat, filename_prefix: str) -> Response:
    if format == ExportFormat.JSON:
        payload = export_records_json(records)
        payload["exported_at"] = datetime.now(UTC).isoformat()
        content = json.dumps(payload, indent=2)
        media_type = "application/json"
        filename = f"{filename_prefix}.json"
    elif format == ExportFormat.CSV:
        content = export_records_csv(records)
        media_type = "text/csv"
        filename = f"{filename_prefix}.csv"
    elif format == ExportFormat.MARKDOWN:
        content = export_records_markdown(records)
        media_type = "text/markdown"
        filename = f"{filename_prefix}.md"
    else:
        raise ForecastOSError(
            code="UNSUPPORTED_EXPORT_FORMAT",
            message="Unsupported export format.",
            status_code=400,
        )

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
