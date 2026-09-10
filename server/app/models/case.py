from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.models.base import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_number = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    priority = Column(String(50), default="medium", index=True, nullable=False)
    status = Column(String(50), default="active", index=True, nullable=False)
    jurisdiction = Column(String(100), nullable=True)
    lead_investigator_id = Column(String(100), nullable=True)
    assigned_investigators = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    suspect_ids = Column(JSON, default=list)
    entity_ids = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        e_ids = self.entity_ids or self.suspect_ids or []
        invs = self.assigned_investigators or ([self.lead_investigator_id] if self.lead_investigator_id else [])
        return {
            "_id": str(self.case_number or self.id),
            "id": self.case_number,
            "caseNumber": self.case_number,
            "title": self.title,
            "summary": self.summary,
            "description": self.summary,
            "priority": self.priority,
            "status": self.status,
            "jurisdiction": self.jurisdiction,
            "leadInvestigatorId": self.lead_investigator_id,
            "leadInvestigators": invs,
            "assignedInvestigators": invs,
            "tags": self.tags or [],
            "suspectIds": e_ids,
            "entityIds": e_ids,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
