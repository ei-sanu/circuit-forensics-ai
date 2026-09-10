from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class UpdateAlertStatusDto(BaseModel):
    status: str = Field(..., description="Alert status: open, investigating, confirmed, dismissed")
    notes: Optional[str] = None

class AlertResponseDto(BaseModel):
    alertId: str
    detectorName: str
    severity: str
    title: str
    explanation: str
    confidence: float = 0.9
    status: str = "open"
    entities: List[Dict[str, Any]] = []
    evidenceIds: List[str] = []
    caseId: Optional[str] = None
    methodology: Optional[str] = None
    metadata: Dict[str, Any] = {}
    createdAt: Optional[Any] = None
    updatedAt: Optional[Any] = None
