from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CreateEntityDto(BaseModel):
    entityId: str = Field(..., description="Unique entity ID e.g. P-0001, O-0001, PH-0001, V-0001")
    type: str = Field(..., description="Entity type: person, organization, phone, vehicle, location, event")
    label: str = Field(..., description="Primary name or identifier")
    aliases: Optional[List[str]] = []
    riskFlag: Optional[bool] = False
    influenceScore: Optional[float] = 0.0
    cases: Optional[List[str]] = []
    properties: Optional[Dict[str, Any]] = {}
    source: Optional[str] = "user"

class EntityResponseDto(BaseModel):
    entityId: str
    type: str
    label: str
    aliases: List[str] = []
    riskFlag: bool = False
    influenceScore: float = 0.0
    cases: List[str] = []
    properties: Dict[str, Any] = {}
    source: str = "user"
    createdAt: Optional[Any] = None
    updatedAt: Optional[Any] = None
