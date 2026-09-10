"""Copilot query and reasoning schemas."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.graph import GraphState


class Citation(BaseModel):
    source_type: str
    count: int
    description: str


class CopilotQueryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    case_id: Optional[str] = None
    graph: Optional[GraphState] = None
    document_summaries: List[str] = Field(default_factory=list)
    use_local_llm: bool = False


class CopilotQueryResponse(BaseModel):
    intent: str
    direct_facts: List[str]
    analytical_reading: str
    citations: List[Citation] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    disclaimer: str = "Analytical indicator only. Does not constitute proof of guilt or criminal activity."
