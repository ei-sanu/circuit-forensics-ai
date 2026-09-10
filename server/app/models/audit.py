from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.models.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), nullable=False, index=True)
    user_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=False)
    details = Column(JSON, default=dict)
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "id": str(self.id),
            "userId": self.user_id,
            "userEmail": self.user_email,
            "action": self.action,
            "resourceType": self.resource_type,
            "resourceId": self.resource_id,
            "details": self.details or {},
            "ipAddress": self.ip_address,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
