from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, Body
from app.core.permissions import get_current_user, require_roles, Role
from app.services.alert_service import alert_service
from app.schemas.alert import UpdateAlertStatusDto

router = APIRouter(prefix="/alerts", tags=["Alerts & Anomaly Detection"])

@router.get("", summary="List suspicious pattern and financial anomaly alerts")
async def list_alerts(
    caseId: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await alert_service.find_all(case_id=caseId, severity=severity, status=status)

@router.get("/{alert_id}", summary="Get detailed explanation and supporting evidence for an alert")
async def get_alert(alert_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await alert_service.find_one(alert_id)

@router.patch("/{alert_id}/status", summary="Update alert status (open, investigating, confirmed, dismissed)")
async def update_alert_status(
    alert_id: str,
    dto: UpdateAlertStatusDto,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION)),
):
    return await alert_service.update_status(alert_id, status=dto.status, user=user)

@router.post("/refresh", summary="Trigger fresh execution of anomaly detectors over current case state")
async def refresh_alerts(
    caseId: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION)),
):
    return await alert_service.trigger_refresh(case_id=caseId or "global", user=user)

@router.post("/refresh/{case_id}", summary="Trigger fresh execution of anomaly detectors for a specific case")
async def refresh_case_alerts(
    case_id: str,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION)),
):
    return await alert_service.trigger_refresh(case_id=case_id, user=user)
