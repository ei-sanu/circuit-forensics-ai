from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Index
from app.models.base import Base

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String(100), nullable=False, index=True)
    target_id = Column(String(100), nullable=False, index=True)
    rel_type = Column(String(100), nullable=False, index=True)
    case_id = Column(String(100), nullable=True, index=True)
    weight = Column(Float, default=1.0)
    interaction_count = Column(Integer, default=1)
    total_amount = Column(Float, default=0.0)
    confidence = Column(Float, default=0.95)
    properties = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_rel_source_target_type", "source_id", "target_id", "rel_type"),
    )

    def to_dict(self):
        return {
            "_id": str(self.id),
            "id": str(self.id),
            "source": self.source_id,
            "target": self.target_id,
            "sourceId": self.source_id,
            "targetId": self.target_id,
            "relType": self.rel_type,
            "rel_type": self.rel_type,
            "caseId": self.case_id,
            "weight": self.weight,
            "count": self.interaction_count,
            "interactionCount": self.interaction_count,
            "total_amount": self.total_amount,
            "totalAmount": self.total_amount,
            "confidence": self.confidence,
            "properties": self.properties or {},
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
