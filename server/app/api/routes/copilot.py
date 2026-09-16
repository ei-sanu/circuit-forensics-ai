from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Body
from app.core.permissions import get_current_user
from app.services.copilot_service import copilot_service
from app.services.rag_service import rag_service
from app.schemas.copilot import CopilotQueryDto

router = APIRouter(prefix="/copilot", tags=["Investigative Copilot"])

@router.get("/model-status", summary="Get status of Fine-Tuned Llama-3.1 model and training datasets")
async def get_model_status_endpoint(
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await copilot_service.get_model_status()

@router.get("/info", summary="Get Copilot system and fine-tuned model information")
async def get_copilot_info_endpoint():
    return await copilot_service.get_model_status()

@router.post("/ask", summary="Ask AI Copilot natural-language investigative questions with citations")
async def ask_copilot_endpoint(
    dto: CopilotQueryDto,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await copilot_service.ask_copilot(
        query=dto.query,
        case_id=dto.caseId,
        user=user,
        api_key=dto.apiKey,
        provider=dto.provider,
        model=dto.model,
        history=dto.history,
    )

@router.post("/query", summary="Query AI Copilot natural-language investigative questions")
async def query_copilot_endpoint(
    dto: CopilotQueryDto,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await copilot_service.ask_copilot(
        query=dto.query,
        case_id=dto.caseId,
        user=user,
        api_key=dto.apiKey,
        provider=dto.provider,
        model=dto.model,
        history=dto.history,
    )


# ── RAG Index Management ──────────────────────────────────────────────────────

@router.get("/rag/status", summary="Get RAG document index status and stats")
async def rag_status_endpoint(
    user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns current RAG vector index stats: total vectors, chunks, model info."""
    return rag_service.get_status()


@router.post("/rag/index", summary="Initialize or update RAG index from case documents")
async def rag_index_endpoint(
    case_id: Optional[str] = Body(default=None, embed=True),
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Load all documents from the database (optionally scoped to a case)
    and build/update the FAISS vector index.
    """
    result = await rag_service.initialize(case_id=case_id)
    return {"success": True, "case_id": case_id, **result}


@router.post("/rag/rebuild", summary="Force full rebuild of RAG index from database")
async def rag_rebuild_endpoint(
    case_id: Optional[str] = Body(default=None, embed=True),
    user: Dict[str, Any] = Depends(get_current_user),
):
    """Force re-embed and re-index all documents, ignoring disk cache."""
    result = await rag_service.rebuild_index(case_id=case_id)
    return {"success": True, "case_id": case_id, **result}

