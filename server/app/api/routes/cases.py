from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from app.core.permissions import get_current_user, require_roles, Role
from app.services.case_service import case_service
from app.schemas.case import CreateCaseDto, UpdateCaseDto

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("", summary="Create a new investigation case")
async def create_case(
    dto: CreateCaseDto,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION))
):
    return await case_service.create(dto, user=user)

@router.get("", summary="List all investigative cases")
async def list_cases(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await case_service.find_all(limit=limit, skip=skip)

@router.get("/{case_number}", summary="Get details of a specific case by caseNumber")
async def get_case(case_number: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await case_service.find_one(case_number)

@router.patch("/{case_number}", summary="Update case metadata, status, or priorities")
async def update_case(
    case_number: str,
    dto: UpdateCaseDto,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION))
):
    return await case_service.update(case_number, dto, user=user)

@router.post("/{case_number}/entities/{entity_id}", summary="Link an entity to a specific case")
async def link_entity(
    case_number: str,
    entity_id: str,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION))
):
    return await case_service.link_entity(case_number, entity_id, user=user)
