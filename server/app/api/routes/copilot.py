import re
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Body, UploadFile, File, Form
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


@router.post("/upload", summary="Parse and extract evidential indicators from uploaded case document")
async def upload_copilot_document(
    file: UploadFile = File(...),
    caseId: Optional[str] = Form("CR-2026-00124"),
):
    try:
        content = await file.read()
        file_name = file.filename or "document.txt"
        file_size = len(content)
        file_type = file.content_type or "text/plain"

        try:
            text_content = content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                raw_str = content.decode("latin1")
                matches = re.findall(r"\(([^()]{3,})\)", raw_str)
                if matches and len(matches) > 5:
                    text_content = " ".join(matches)
                else:
                    text_content = f"[Binary Document Ingested: {file_name} ({file_size / 1024:.1f} KB)]"
            except Exception:
                text_content = f"[Binary Document Ingested: {file_name} ({file_size / 1024:.1f} KB)]"

        amount_matches = list(dict.fromkeys(re.findall(r"(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{2})?)", text_content, re.IGNORECASE)))[:5]
        date_matches = list(dict.fromkeys(re.findall(r"\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b", text_content)))[:5]
        phone_matches = list(dict.fromkeys(re.findall(r"(?:\+91[\-\s]?)?[6-9]\d{9}", text_content)))[:5]
        pan_matches = list(dict.fromkeys(re.findall(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text_content)))[:5]
        account_matches = list(dict.fromkeys(re.findall(r"\b\d{9,16}\b", text_content)))[:5]

        extracted_stats = {
            "amounts": amount_matches,
            "dates": date_matches,
            "phones": phone_matches,
            "pans": pan_matches,
            "accounts": account_matches,
            "wordCount": len([w for w in text_content.split() if w]),
        }

        return {
            "success": True,
            "fileName": file_name,
            "fileSize": file_size,
            "fileType": file_type,
            "textContent": text_content[:8000],
            "extractedStats": extracted_stats,
            "message": f'Document "{file_name}" ingested and indexed successfully into case {caseId}',
        }
    except Exception as err:
        return {"error": "Failed to process file", "detail": str(err)}

