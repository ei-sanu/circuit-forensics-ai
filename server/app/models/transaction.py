from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, Index
from app.models.base import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    case_id = Column(String(100), nullable=True, index=True)
    from_id = Column(String(100), nullable=False, index=True)
    to_id = Column(String(100), nullable=False, index=True)
    from_type = Column(String(50), nullable=True, default="person")
    to_type = Column(String(50), nullable=True, default="organization")
    from_account = Column(String(100), nullable=True)
    to_account = Column(String(100), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    channel = Column(String(50), default="NEFT")
    is_flagged = Column(Boolean, default=False)
    flags = Column(JSON, default=list)
    status = Column(String(50), default="completed")

    def to_dict(self):
        return {
            "_id": str(self.transaction_id or self.id),
            "id": self.transaction_id,
            "transactionId": self.transaction_id,
            "caseId": self.case_id,
            "fromId": self.from_id,
            "toId": self.to_id,
            "fromType": self.from_type,
            "toType": self.to_type,
            "fromAccount": self.from_account,
            "toAccount": self.to_account,
            "amount": self.amount,
            "currency": self.currency,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "channel": self.channel,
            "isFlagged": self.is_flagged,
            "flags": self.flags or [],
            "status": self.status,
        }

class Communication(Base):
    __tablename__ = "communications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    communication_id = Column(String(100), unique=True, index=True, nullable=False)
    case_id = Column(String(100), nullable=True, index=True)
    from_number = Column(String(50), nullable=False, index=True)
    to_number = Column(String(50), nullable=False, index=True)
    from_person_id = Column(String(100), nullable=True)
    to_person_id = Column(String(100), nullable=True)
    type = Column(String(50), default="voice_call")
    duration = Column(Integer, default=0)  # in seconds
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    cell_tower_id = Column(String(100), nullable=True)
    content_summary = Column(String(500), nullable=True)

    def to_dict(self):
        return {
            "_id": str(self.communication_id or self.id),
            "id": self.communication_id,
            "communicationId": self.communication_id,
            "caseId": self.case_id,
            "fromNumber": self.from_number,
            "toNumber": self.to_number,
            "fromPersonId": self.from_person_id,
            "toPersonId": self.to_person_id,
            "type": self.type,
            "commType": self.type,
            "duration": self.duration,
            "durationSeconds": self.duration,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "cellTowerId": self.cell_tower_id,
            "contentSummary": self.content_summary,
        }
