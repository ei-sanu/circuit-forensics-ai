from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CreateCaseDto(BaseModel):
    caseNumber: str = Field(..., description="Unique case identifier e.g. CR-2026-00124")
    title: str = Field(..., description="Case operation title")
    description: Optional[str] = ""
    status: Optional[str] = "active"
    priority: Optional[str] = "medium"
    leadInvestigators: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    entityIds: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}

class UpdateCaseDto(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    leadInvestigators: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    entityIds: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class CaseResponseDto(BaseModel):
    caseNumber: str
    title: str
    description: Optional[str] = ""
    status: str = "active"
    priority: str = "medium"
    leadInvestigators: List[str] = []
    tags: List[str] = []
    entityIds: List[str] = []
    metadata: Dict[str, Any] = {}
    createdAt: Optional[Any] = None
    updatedAt: Optional[Any] = None
