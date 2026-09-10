"""Copilot AI query endpoint."""
from fastapi import APIRouter, Depends
from app.core.copilot_engine import CopilotEngine
from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse
from app.security import verify_service_key

router = APIRouter(prefix="/ml", tags=["Copilot"])
copilot = CopilotEngine()


@router.post("/copilot", response_model=CopilotQueryResponse, dependencies=[Depends(verify_service_key)])
async def query_copilot(req: CopilotQueryRequest) -> CopilotQueryResponse:
    """Answers investigative queries with fact-checked citations and graph context."""
    return await copilot.answer_query(req)
