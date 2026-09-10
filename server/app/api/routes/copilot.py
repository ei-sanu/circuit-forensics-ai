from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends
from app.core.permissions import get_current_user
from app.services.copilot_service import copilot_service
from app.schemas.copilot import CopilotQueryDto

router = APIRouter(prefix="/copilot", tags=["Investigative Copilot"])

@router.post("/ask", summary="Ask AI Copilot natural-language investigative questions with citations")
async def ask_copilot_endpoint(
    dto: CopilotQueryDto,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await copilot_service.ask_copilot(query=dto.query, case_id=dto.caseId, user=user)

@router.post("/query", summary="Query AI Copilot natural-language investigative questions")
async def query_copilot_endpoint(
    dto: CopilotQueryDto,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await copilot_service.ask_copilot(query=dto.query, case_id=dto.caseId, user=user)
