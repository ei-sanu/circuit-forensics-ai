from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CopilotQueryDto(BaseModel):
    query: str = Field(..., description="Natural language investigative question")
    caseId: Optional[str] = None
    apiKey: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = None

class CopilotResponseDto(BaseModel):
    answer: str
    confidence: float
    citations: List[Dict[str, Any]] = []
    suggested_actions: List[str] = []
    entities_mentioned: List[str] = []

