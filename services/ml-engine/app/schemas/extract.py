"""Extraction request and response schemas."""
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field


class ExtractedEntity(BaseModel):
    id: str = Field(..., description="Temporary identifier (e.g. temp_p_1)")
    type: str = Field(..., description="person, organization, phone, vehicle, location, money, date")
    label: str = Field(..., description="Normalized entity text or formatted string")
    original_text: str = Field(..., description="Raw text matched in document")
    span: Tuple[int, int] = Field(..., description="Character start and end offsets [start, end]")
    confidence: float = Field(..., ge=0.0, le=1.0)
    meta: Dict[str, Any] = Field(default_factory=dict)


class ProposedRelationship(BaseModel):
    source_temp_id: str
    target_temp_id: str
    rel_type: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    evidence_text: Optional[str] = None
    meta: Dict[str, Any] = Field(default_factory=dict)


class ExtractRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Raw unstructured text from FIR or document")
    document_id: Optional[str] = Field(None, description="Associated document ID")
    language: str = Field(default="en", description="Language code (en, hi)")


class ExtractResponse(BaseModel):
    document_id: Optional[str] = None
    entities: List[ExtractedEntity]
    proposed_relationships: List[ProposedRelationship]
    execution_time_ms: float
