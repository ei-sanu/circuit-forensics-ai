"""Unified Multi-Modal Chronological Intelligence Timeline REST Routes."""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query

from app.core.permissions import get_current_user
from app.services.timeline_service import timeline_service

router = APIRouter(prefix="/timeline", tags=["Case Chronology & Timeline"])


@router.get("", summary="Get unified chronological intelligence timeline across transactions, CDR, FIRs, documents, and alerts")
async def get_timeline(
    caseId: Optional[str] = Query(None, description="Case identifier scope"),
    entityId: Optional[str] = Query(None, description="Filter timeline events involving a specific entity"),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await timeline_service.get_case_timeline(
        case_id=caseId,
        entity_id=entityId,
        limit=limit,
        skip=skip,
    )
