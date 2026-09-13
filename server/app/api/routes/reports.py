"""Court-Admissible Dossier and Intelligence Report Generation REST Routes."""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.core.permissions import get_current_user, require_roles, Role
from app.services.evidence_service import evidence_service

router = APIRouter(prefix="/reports", tags=["Court Dossiers & Statutory Reports"])


class GenerateReportDto(BaseModel):
    caseId: str = Field(..., json_schema_extra={"example": "CR-2026-00124"})
    entityId: Optional[str] = Field(default=None, json_schema_extra={"example": "P-0001"})
    officerName: Optional[str] = Field(default="Inspector Rajesh Sharma", json_schema_extra={"example": "Inspector Rajesh Sharma"})
    officerBadge: Optional[str] = Field(default="MH-CID-8821", json_schema_extra={"example": "MH-CID-8821"})


@router.post("/generate", summary="Generate a court-admissible intelligence dossier with Section 63 BSA / 65B Evidence Act certificate")
async def generate_court_report(
    dto: GenerateReportDto,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.ANALYST, Role.POLICE_STATION)),
):
    officer_name = dto.officerName or user.get("name") or "Investigating Officer"
    officer_badge = dto.officerBadge or user.get("badgeNumber") or "CID-SPECIAL-UNIT"
    return await evidence_service.generate_court_dossier(
        case_id=dto.caseId,
        entity_id=dto.entityId,
        officer_name=officer_name,
        officer_badge=officer_badge,
    )


@router.get("/cases/{case_id}", summary="Fetch standard case dossier report")
async def get_case_report(
    case_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await evidence_service.generate_court_dossier(
        case_id=case_id,
        officer_name=user.get("name") or "Officer",
        officer_badge=user.get("badgeNumber") or "CIRCUIT-OFFICER",
    )
