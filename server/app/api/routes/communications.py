"""Telecommunications and CDR (Call Detail Record) Ingestion REST Routes."""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from pydantic import BaseModel, Field

from app.core.permissions import get_current_user, require_roles, Role
from app.services.communication_service import communication_service

router = APIRouter(prefix="/communications", tags=["Telecom Intelligence & CDR Analysis"])


class CreateCommunicationDto(BaseModel):
    communicationId: Optional[str] = None
    caseId: Optional[str] = None
    fromNumber: str = Field(..., json_schema_extra={"example": "+919876543210"})
    toNumber: str = Field(..., json_schema_extra={"example": "+919811122233"})
    fromPersonId: Optional[str] = None
    toPersonId: Optional[str] = None
    type: Optional[str] = Field(default="voice_call", json_schema_extra={"example": "voice_call"})
    duration: Optional[int] = Field(default=0, json_schema_extra={"example": 184})
    timestamp: Optional[str] = None
    cellTowerId: Optional[str] = Field(default=None, json_schema_extra={"example": "TOWER-MUM-400051-A"})
    contentSummary: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED, summary="Log a new telecommunication / CDR event")
async def create_communication(
    dto: CreateCommunicationDto,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.ANALYST, Role.POLICE_STATION)),
):
    return await communication_service.create(dto.model_dump(), user=user)


@router.get("", summary="List telecommunication logs with caller, tower, and time filters")
async def list_communications(
    caseId: Optional[str] = Query(None, description="Case identifier scope"),
    phoneNumber: Optional[str] = Query(None, description="Search either caller or callee number"),
    fromNumber: Optional[str] = Query(None, description="Filter specific caller number"),
    toNumber: Optional[str] = Query(None, description="Filter specific callee number"),
    commType: Optional[str] = Query(None, description="Communication medium (voice_call, sms, encrypted_voip)"),
    cellTowerId: Optional[str] = Query(None, description="Cell tower location ID"),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await communication_service.find_all(
        case_id=caseId,
        phone_number=phoneNumber,
        from_number=fromNumber,
        to_number=toNumber,
        comm_type=commType,
        cell_tower_id=cellTowerId,
        limit=limit,
        skip=skip,
    )


@router.get("/stats", summary="Get aggregated telecom analytics and nocturnal call distribution")
async def get_communication_stats(
    caseId: Optional[str] = Query(None, description="Case identifier scope"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await communication_service.get_stats(case_id=caseId)


@router.post("/import", summary="Batch ingest telecom CDR logs from CSV or JSON files")
async def import_communications(
    file: UploadFile = File(...),
    caseId: Optional[str] = Form(None),
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.ANALYST, Role.POLICE_STATION)),
):
    file_bytes = await file.read()
    file_name = file.filename or "cdr_logs.csv"
    return await communication_service.import_batch(
        file_bytes=file_bytes,
        file_name=file_name,
        case_id=caseId,
        user=user,
    )


@router.get("/{communication_id}", summary="Get full details of a specific communication record")
async def get_communication(
    communication_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await communication_service.find_one(communication_id)
