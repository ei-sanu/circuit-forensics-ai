from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from app.core.permissions import get_current_user, require_roles, Role
from app.services.entity_service import entity_service
from app.schemas.entity import CreateEntityDto

router = APIRouter(prefix="/entities", tags=["Entities"])

@router.post("", summary="Register a new verified entity in the intelligence registry")
async def create_entity(
    dto: CreateEntityDto,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION, Role.HR))
):
    return await entity_service.create(dto, user=user)

@router.get("", summary="Query and filter entities with fuzzy search, case scoping, and risk filters")
async def list_entities(
    type: Optional[str] = None,
    risk: Optional[bool] = None,
    caseId: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await entity_service.find_all(
        type=type, risk=risk, case_id=caseId, q=q, limit=limit, skip=skip
    )

@router.get("/{entity_id}", summary="Get full entity profile and intelligence details")
async def get_entity(entity_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await entity_service.find_one(entity_id)
