from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.models.base import Base

class FIR(Base):
    __tablename__ = "firs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fir_number = Column(String(100), unique=True, index=True, nullable=False)
    police_station = Column(String(255), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), default="Maharashtra")
    incident_date = Column(DateTime(timezone=True), nullable=False)
    registration_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    incident_location = Column(String(255), nullable=True)
    complainant_name = Column(String(255), nullable=False)
    complainant_contact = Column(String(100), nullable=True)
    accused_names = Column(JSON, default=list)
    victim_names = Column(JSON, default=list)
    suspect_ids = Column(JSON, default=list)
    sections = Column(JSON, default=list)
    ipc_sections = Column(JSON, default=list)
    acts = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    narrative = Column(Text, nullable=True)
    brief_facts = Column(Text, nullable=True)
    status = Column(String(50), default="registered")
    case_id = Column(String(100), nullable=True, index=True)
    officer_in_charge = Column(String(255), nullable=True)
    filed_by_user_id = Column(String(100), nullable=True)
    scanned_copy_url = Column(String(500), nullable=True)
    ocr_raw_text = Column(Text, nullable=True)
    linked_case_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        secs = self.sections or []
        desc = self.summary or self.narrative or ""
        return {
            "_id": str(self.fir_number or self.id),
            "id": self.fir_number,
            "firNumber": self.fir_number,
            "policeStation": self.police_station,
            "district": self.district,
            "state": self.state,
            "incidentDate": self.incident_date.isoformat() if self.incident_date else None,
            "incidentLocation": self.incident_location,
            "complainantName": self.complainant_name,
            "complainantContact": self.complainant_contact,
            "accusedNames": self.accused_names or [],
            "suspectIds": self.suspect_ids or [],
            "sections": secs,
            "ipcSections": secs,
            "acts": self.acts or [],
            "summary": self.summary,
            "description": desc,
            "narrative": self.narrative,
            "status": self.status,
            "caseId": self.case_id,
            "officerInCharge": self.officer_in_charge,
            "filedByUserId": self.filed_by_user_id,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
