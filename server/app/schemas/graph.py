from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class GraphNodeDto(BaseModel):
    id: str
    label: str
    entity_type: str
    risk_flag: bool = False
    properties: Optional[Dict[str, Any]] = {}

class GraphEdgeDto(BaseModel):
    source: str
    target: str
    rel_type: str
    count: Optional[int] = 1
    total_amount: Optional[float] = 0.0
    confidence: Optional[float] = 1.0
    source_type: Optional[str] = "explicit"
    properties: Optional[Dict[str, Any]] = {}

class GraphStateDto(BaseModel):
    nodes: List[GraphNodeDto]
    edges: List[GraphEdgeDto]

class GraphSimulateDto(BaseModel):
    nodeId: str = Field(..., description="ID of entity node to simulate removing")

class TransactionResponseDto(BaseModel):
    transactionId: str
    fromType: str
    fromId: str
    toType: str
    toId: str
    amount: float
    timestamp: Any
    channel: str = "bank_transfer"
    isFlagged: bool = False
    caseId: Optional[str] = None
    metadata: Dict[str, Any] = {}

class CommunicationResponseDto(BaseModel):
    communicationId: str
    fromNumber: str
    toNumber: str
    timestamp: Any
    durationSeconds: int = 0
    towerId: Optional[str] = None
    fromPersonId: Optional[str] = None
    toPersonId: Optional[str] = None
    commType: str = "voice_call"
    caseId: Optional[str] = None
    metadata: Dict[str, Any] = {}
