from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, JSON
from app.models.base import Base

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # person, organization, phone, vehicle, location, event
    risk_flag = Column(Boolean, default=False, index=True)
    influence_score = Column(Float, default=0.0)
    properties = Column(JSON, default=dict)
    aliases = Column(JSON, default=list)
    cases = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        props = self.properties or {}
        return {
            "_id": str(self.entity_id or self.id),
            "id": self.entity_id,
            "entityId": self.entity_id,
            "name": self.name,
            "label": self.name,
            "type": self.type,
            "entity_type": self.type,
            "risk_flag": self.risk_flag,
            "risk": self.risk_flag,
            "riskFlag": self.risk_flag,
            "influenceScore": self.influence_score,
            "properties": props,
            "aliases": self.aliases or [],
            "cases": self.cases or [],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
