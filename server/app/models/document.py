from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, BigInteger, Text, DateTime, JSON
from app.models.base import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(String(100), unique=True, index=True, nullable=False)
    case_id = Column(String(100), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(100), nullable=True)
    file_size = Column(BigInteger, default=0)
    mime_type = Column(String(100), nullable=True)
    r2_key = Column(String(500), nullable=True)
    r2_url = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=True)
    status = Column(String(50), default="processed", index=True)
    extracted_entities = Column(JSON, default=list)
    extracted_edges = Column(JSON, default=list)
    proposed_relationships = Column(JSON, default=list)
    approved_entities = Column(JSON, default=list)
    approved_edges = Column(JSON, default=list)
    uploaded_by = Column(String(100), nullable=True)
    meta_data = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "_id": str(self.document_id or self.id),
            "id": self.document_id,
            "documentId": self.document_id,
            "caseId": self.case_id,
            "title": self.title,
            "fileName": self.file_name or self.title,
            "fileType": self.file_type or self.mime_type,
            "fileSize": self.file_size,
            "mimeType": self.mime_type,
            "r2Key": self.r2_key,
            "r2Url": self.r2_url,
            "fileUrl": self.r2_url,
            "rawText": self.raw_text,
            "status": self.status,
            "extractedEntities": self.extracted_entities or [],
            "extractedEdges": self.extracted_edges or [],
            "proposedRelationships": self.proposed_relationships or self.extracted_edges or [],
            "approvedEntities": self.approved_entities or [],
            "approvedEdges": self.approved_edges or [],
            "uploadedBy": self.uploaded_by,
            "metadata": self.meta_data or {},
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
