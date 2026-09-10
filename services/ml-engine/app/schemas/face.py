"""Pydantic schemas for 1:1 Facial Biometric Verification and Enrollment."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class FaceQualityMetrics(BaseModel):
    brightness: float = Field(..., description="Average luminance 0-255")
    contrast: float = Field(..., description="Image dynamic range score 0-100")
    sharpness: float = Field(..., description="Laplacian spatial frequency variance")
    is_acceptable: bool = Field(..., description="Whether frame meets quality baseline")
    face_count: int = Field(..., description="Number of detected facial targets")


class FaceEnrollRequest(BaseModel):
    face_image: str = Field(..., description="Base64 encoded JPEG/PNG image or data URL")
    user_id: Optional[str] = Field(None, description="Claimed user identifier")
    liveness_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Client active liveness proof")


class FaceEnrollResponse(BaseModel):
    success: bool
    embedding: List[float] = Field(..., description="128-dimensional L2-normalized biometric embedding vector")
    quality_score: float = Field(..., description="Composite quality metric 0-100")
    model_version: str = Field(default="circuit-facenet-v1")
    details: Dict[str, Any] = Field(default_factory=dict)
    message: str = "Biometric template generated successfully"


class FaceVerifyRequest(BaseModel):
    face_image: str = Field(..., description="Base64 encoded live camera verification frame")
    enrolled_template: List[float] = Field(..., description="Decrypted 128-d reference embedding vector")
    liveness_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Active liveness signals (e.g. blinks, movement)")
    threshold: Optional[float] = Field(0.78, description="Cosine similarity acceptance threshold")


class FaceVerifyResponse(BaseModel):
    verified: bool = Field(..., description="Whether similarity meets threshold and liveness passes")
    similarity_score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
    confidence: float = Field(..., description="Statistical confidence percentage (0 to 100)")
    liveness_passed: bool = Field(..., description="Whether active presentation attack checks passed")
    model_version: str = Field(default="circuit-facenet-v1")
    reasoning: str = Field(..., description="Auditable decision rationale")
    details: Dict[str, Any] = Field(default_factory=dict)
