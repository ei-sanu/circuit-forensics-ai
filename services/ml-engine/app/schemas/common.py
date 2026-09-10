"""Common Pydantic models for ML Engine."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EntityNode(BaseModel):
    id: str = Field(..., description="Unique node identifier (e.g., person:P-001 or P-001)")
    label: str = Field(..., description="Human-readable label/name")
    entity_type: str = Field(..., description="person, organization, phone, vehicle, location, event")
    properties: Dict[str, Any] = Field(default_factory=dict)
    risk_flag: bool = Field(default=False)
    aliases: List[str] = Field(default_factory=list)


class GraphEdge(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    rel_type: str = Field(..., description="called, transferred_money, associate_of, owner_of, etc.")
    count: int = Field(default=1, description="Weight/Frequency of interaction")
    total_amount: float = Field(default=0.0, description="Total amount if financial")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source_type: str = Field(default="explicit", description="explicit, cdr, financial, ai_inferred")
    properties: Dict[str, Any] = Field(default_factory=dict)


class TransactionRecord(BaseModel):
    id: str
    from_type: str
    from_id: str
    to_type: str
    to_id: str
    amount: float
    timestamp: str
    channel: Optional[str] = "bank_transfer"
    is_flagged: bool = False


class CommunicationRecord(BaseModel):
    id: str
    from_number: str
    to_number: str
    timestamp: str
    duration_seconds: int = 0
    tower_id: Optional[str] = None
    from_person_id: Optional[str] = None
    to_person_id: Optional[str] = None
