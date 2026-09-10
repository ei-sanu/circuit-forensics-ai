from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class UploadDocumentDto(BaseModel):
    caseId: Optional[str] = None
    title: Optional[str] = None

class CommitDocumentDto(BaseModel):
    approvedEntities: Optional[List[Dict[str, Any]]] = []
    approvedRelationships: Optional[List[Dict[str, Any]]] = []

class DocumentResponseDto(BaseModel):
    documentId: str
    caseId: Optional[str] = None
    title: str
    fileName: str
    fileSize: int
    mimeType: str
    r2Key: str
    r2Url: Optional[str] = None
    rawText: Optional[str] = ""
    status: str = "uploaded"
    extractedEntities: List[Dict[str, Any]] = []
    proposedRelationships: List[Dict[str, Any]] = []
    uploadedBy: Optional[str] = None
    metadata: Dict[str, Any] = {}
    createdAt: Optional[Any] = None
    updatedAt: Optional[Any] = None
