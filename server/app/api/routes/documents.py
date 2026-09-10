from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from app.core.permissions import get_current_user, require_roles, Role
from app.services.document_service import document_service
from app.schemas.document import CommitDocumentDto

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", summary="Upload an investigative document (PDF/TXT/CSV), stream to R2, and trigger AI extraction")
async def upload_document(
    file: UploadFile = File(...),
    caseId: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION)),
):
    return await document_service.upload_and_process(file=file, case_id=caseId, title=title, user=user)

@router.get("", summary="List uploaded intelligence documents")
async def list_documents(
    caseId: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await document_service.find_all(case_id=caseId, limit=limit, skip=skip)

@router.get("/{document_id}", summary="Get document details, signed download link, and extracted AI proposals")
async def get_document(document_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await document_service.find_one(document_id)

@router.post("/{document_id}/commit", summary="Human-in-the-loop review: approve and commit extracted entities & edges into PostgreSQL graph")
async def commit_document(
    document_id: str,
    dto: CommitDocumentDto,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION)),
):
    return await document_service.commit(document_id, dto, user=user)
