from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.records import RecordListResponse, RecordResponse, RecordUpdateRequest
from app.services.record_service import (
    delete_record,
    get_record,
    list_records,
    record_to_response,
    update_record,
)

router = APIRouter(prefix="/records", tags=["records"])


@router.get("", response_model=RecordListResponse)
def list_saved_records(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> RecordListResponse:
    items, total = list_records(db, skip=skip, limit=limit)
    return RecordListResponse(
        items=[record_to_response(record) for record in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{record_id}", response_model=RecordResponse)
def get_saved_record(
    record_id: int,
    db: Session = Depends(get_db),
) -> RecordResponse:
    return record_to_response(get_record(db, record_id))


@router.patch("/{record_id}", response_model=RecordResponse)
def patch_saved_record(
    record_id: int,
    payload: RecordUpdateRequest,
    db: Session = Depends(get_db),
) -> RecordResponse:
    return record_to_response(update_record(db, record_id, payload))


@router.delete("/{record_id}", status_code=204)
def remove_saved_record(
    record_id: int,
    db: Session = Depends(get_db),
) -> None:
    delete_record(db, record_id)
