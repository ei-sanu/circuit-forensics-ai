from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime
from app.models.base import Base

class BiometricCredential(Base):
    __tablename__ = "biometric_credentials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), unique=True, index=True, nullable=False)
    user_email = Column(String(255), index=True, nullable=False)
    template_encrypted = Column(Text, nullable=False)  # ivHex:authTagHex:ciphertextHex
    salt_hex = Column(String(64), nullable=True, default="")
    iv_hex = Column(String(64), nullable=True, default="")
    algorithm = Column(String(50), default="AES-256-GCM")
    quality_score = Column(Float, default=0.0)
    model_version = Column(String(50), default="circuit-facenet-v1")
    enrollment_version = Column(Integer, default=1)
    status = Column(String(50), default="active")
    enrolled_by = Column(String(100), default="SYSTEM")
    is_enrolled = Column(Boolean, default=True)
    last_verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "_id": str(self.user_id or self.id),
            "id": str(self.user_id or self.id),
            "userId": self.user_id,
            "userEmail": self.user_email,
            "templateEncrypted": self.template_encrypted,
            "encryptedTemplate": self.template_encrypted,
            "saltHex": self.salt_hex,
            "ivHex": self.iv_hex,
            "algorithm": self.algorithm,
            "qualityScore": self.quality_score,
            "modelVersion": self.model_version,
            "enrollmentVersion": self.enrollment_version,
            "status": self.status,
            "enrolledBy": self.enrolled_by,
            "isEnrolled": self.is_enrolled,
            "lastVerifiedAt": self.last_verified_at.isoformat() if self.last_verified_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

class AuthChallenge(Base):
    __tablename__ = "auth_challenges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    challenge_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(String(100), index=True, nullable=False)
    user_email = Column(String(255), nullable=False)
    expected_step = Column(String(50), default="position")
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    is_used = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "_id": str(self.challenge_id or self.id),
            "id": self.challenge_id,
            "challengeId": self.challenge_id,
            "userId": self.user_id,
            "userEmail": self.user_email,
            "expectedStep": self.expected_step,
            "attempts": self.attempts,
            "maxAttempts": self.max_attempts,
            "isUsed": self.is_used,
            "isLocked": self.is_locked,
            "ipAddress": self.ip_address,
            "userAgent": self.user_agent,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "verified": self.verified,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
