from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from app.models.base import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(String(100), unique=True, index=True, nullable=False)
    case_id = Column(String(100), nullable=True, index=True)
    detector_name = Column(String(255), nullable=False)
    severity = Column(String(50), nullable=False, index=True)  # critical, high, medium, low
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    confidence = Column(Float, default=0.95)
    status = Column(String(50), default="open", index=True)  # open, investigating, resolved, dismissed
    entities = Column(JSON, default=list)
    evidence_ids = Column(JSON, default=list)
    methodology = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "_id": str(self.alert_id or self.id),
            "id": self.alert_id,
            "alertId": self.alert_id,
            "caseId": self.case_id,
            "detectorName": self.detector_name,
            "severity": self.severity,
            "title": self.title,
            "explanation": self.explanation,
            "confidence": self.confidence,
            "status": self.status,
            "entities": self.entities or [],
            "evidenceIds": self.evidence_ids or [],
            "methodology": self.methodology,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
