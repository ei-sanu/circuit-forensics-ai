from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from app.core.permissions import require_roles, Role
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit", tags=["Audit Logs & Compliance"])

@router.get("", summary="Retrieve recent compliance and system audit logs")
async def get_audit_logs(
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    user: Dict[str, Any] = Depends(require_roles(Role.ADMIN, Role.ANALYST, Role.INVESTIGATOR)),
):
    return await audit_service.find_all(limit=limit, skip=skip)
