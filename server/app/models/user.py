from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="investigator")
    department = Column(String(255), nullable=True, default="Intelligence Operations")
    station_name = Column(String(255), nullable=True)
    badge_number = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    incharge_rank = Column(String(100), nullable=True)
    incharge_name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    status = Column(String(50), default="approved", nullable=False)
    reviewed_by_admin = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "_id": str(self.user_id or self.id),
            "userId": self.user_id,
            "id": self.user_id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "department": self.department,
            "stationName": self.station_name,
            "badgeNumber": self.badge_number,
            "district": self.district,
            "inchargeRank": self.incharge_rank,
            "inchargeName": self.incharge_name,
            "phone": self.phone,
            "isActive": self.is_active,
            "status": self.status,
            "reviewedByAdmin": self.reviewed_by_admin,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
