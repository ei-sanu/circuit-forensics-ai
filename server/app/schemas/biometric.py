from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class VerifyFaceDto(BaseModel):
    challengeId: str = Field(..., description="Unique 2FA verification challenge ID")
    faceImage: str = Field(..., description="Base64 data URL JPEG frame captured from optical HUD")
    livenessData: Optional[Dict[str, Any]] = None
    threshold: Optional[float] = None

class VerifyTouchIdDto(BaseModel):
    challengeId: str = Field(..., description="Unique 2FA verification challenge ID")
    credential: Dict[str, Any] = Field(..., description="WebAuthn platform credential returned by Mac Touch ID")
    deviceInfo: Optional[Dict[str, Any]] = None

class EnrollFaceDto(BaseModel):
    userId: Optional[str] = None
    faceImage: str = Field(..., description="Base64 data URL JPEG frame for enrollment")
    livenessProof: Optional[Dict[str, Any]] = None

class BiometricStatusDto(BaseModel):
    isEnrolled: bool
    status: str
    qualityScore: Optional[float] = None
    algorithm: Optional[str] = "AES-256-GCM"
    modelVersion: Optional[str] = "circuit-facenet-v1"
    lastVerifiedAt: Optional[str] = None
    enrolledAt: Optional[str] = None

class BiometricTelemetryDto(BaseModel):
    totalEnrolledUsers: int
    activeChallengesCount: int
    verificationEventsCount: int
    securityIncidentsCount: int
    averageConfidenceScore: float
    systemAlgorithm: str = "AES-256-GCM"
    modelVersion: str = "circuit-facenet-v1"
