"""Entity resolution request and response schemas."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EntityCandidate(BaseModel):
    id: str = Field(..., description="Canonical ID in database (e.g., P-001, O-01)")
    type: str = Field(..., description="person, organization, phone, vehicle, location")
    name: str
    aliases: List[str] = Field(default_factory=list)
    attributes: Dict[str, Any] = Field(default_factory=dict)


class TargetEntity(BaseModel):
    type: str = Field(..., description="person, organization, phone, vehicle, location")
    label: str = Field(..., description="Query name or identifier")
    attributes: Dict[str, Any] = Field(default_factory=dict)


class MatchResult(BaseModel):
    matched_id: Optional[str] = Field(None, description="Matched canonical ID or None if new")
    confidence: float = Field(..., ge=0.0, le=1.0)
    decision: str = Field(..., description="'match', 'alias', or 'new_candidate'")
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    reasoning: str


class ResolveRequest(BaseModel):
    target: TargetEntity
    candidates: List[EntityCandidate] = Field(default_factory=list)
    threshold: float = Field(default=0.75, ge=0.0, le=1.0)


class ResolveResponse(BaseModel):
    result: MatchResult
