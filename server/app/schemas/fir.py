from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CreateFirDto(BaseModel):
    firNumber: str
    policeStation: str
    district: str
    inchargeOfficer: str
    complainantName: str
    complainantPhone: Optional[str] = None
    accusedNames: Optional[List[str]] = []
    ipcSections: Optional[List[str]] = []
    incidentDate: Optional[Any] = None
    incidentLocation: Optional[str] = None
    description: str
    firCopyUrl: Optional[str] = None
    ocrExtractedText: Optional[str] = None
    ocrEntities: Optional[Dict[str, Any]] = {}
    matchedSuspectIds: Optional[List[str]] = []
    matchedSyndicateRisk: Optional[float] = 0.0
    status: Optional[str] = "registered"
    filedByStation: Optional[str] = None

class FirResponseDto(BaseModel):
    id: Optional[str] = None
    firNumber: str
    policeStation: str
    district: str
    inchargeOfficer: str
    complainantName: str
    complainantPhone: Optional[str] = None
    accusedNames: List[str] = []
    ipcSections: List[str] = []
    incidentDate: Optional[Any] = None
    incidentLocation: Optional[str] = None
    description: str
    firCopyUrl: Optional[str] = None
    ocrExtractedText: Optional[str] = None
    ocrEntities: Dict[str, Any] = {}
    matchedSuspectIds: List[str] = []
    matchedSyndicateRisk: float = 0.0
    status: str = "registered"
    filedByUserId: Optional[str] = None
    filedByStation: Optional[str] = None
    createdAt: Optional[Any] = None
    updatedAt: Optional[Any] = None
