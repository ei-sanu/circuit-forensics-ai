from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AuditLogEntryDto(BaseModel):
    userId: str
    userEmail: str
    action: str
    resourceType: str
    resourceId: str
    details: Optional[Dict[str, Any]] = {}
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    createdAt: Optional[Any] = None
