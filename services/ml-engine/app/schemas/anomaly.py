"""Anomaly and suspicious pattern detection schemas."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import CommunicationRecord, EntityNode, GraphEdge, TransactionRecord


class AnomalyAlert(BaseModel):
    id: str
    detector_name: str
    severity: str = Field(..., description="low, medium, high, critical")
    title: str
    explanation: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    entities: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_ids: List[str] = Field(default_factory=list)
    case_id: Optional[str] = None
    methodology: str


class DetectAnomaliesRequest(BaseModel):
    nodes: List[EntityNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)
    transactions: List[TransactionRecord] = Field(default_factory=list)
    communications: List[CommunicationRecord] = Field(default_factory=list)
    enabled_detectors: Optional[List[str]] = None


class DetectAnomaliesResponse(BaseModel):
    total_alerts: int
    alerts: List[AnomalyAlert]
    execution_time_ms: float
