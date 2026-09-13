"""Evidence Integrity and Multi-Source Provenance REST Routes."""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query

from app.core.permissions import get_current_user
from app.services.evidence_service import evidence_service
from app.services.document_service import document_service

router = APIRouter(prefix="/evidence", tags=["Evidence & Provenance Tracking"])


@router.get("/provenance/{entity_id}", summary="Get complete multi-source evidentiary provenance trail for an entity")
async def get_entity_provenance(
    entity_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await evidence_service.get_entity_provenance(entity_id)


@router.get("/verify/{document_id}", summary="Verify cryptographic SHA-256 evidence integrity of a document")
async def verify_document_evidence(
    document_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await document_service.verify_hash(document_id)
