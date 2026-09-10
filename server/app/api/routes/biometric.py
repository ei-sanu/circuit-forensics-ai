from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Request
from app.core.permissions import get_current_user, get_optional_user
from app.services.biometric_service import biometric_service
from app.schemas.biometric import VerifyFaceDto, EnrollFaceDto

router = APIRouter(prefix="/biometric", tags=["Biometric Identity & Facial Verification"])

@router.post("/verify", summary="1:1 Live facial biometric verification against claimed auth challenge")
async def verify_face(dto: VerifyFaceDto, request: Request):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await biometric_service.verify_face(dto, ip=ip, user_agent=user_agent)

@router.post("/enroll", summary="Enroll a user facial biometric identity template")
async def enroll_face(
    dto: EnrollFaceDto,
    request: Request,
    user: Dict[str, Any] = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    enrolled_by = user.get("email", "self")
    return await biometric_service.enroll_face(user, dto, enrolled_by, ip=ip, user_agent=user_agent)

@router.get("/status", summary="Get current user biometric credential status")
async def get_my_status(user: Dict[str, Any] = Depends(get_current_user)):
    user_id = user.get("userId") or user.get("id") or user.get("sub")
    return await biometric_service.get_biometric_status(user_id)

@router.get("/status/{user_id}", summary="Get biometric credential status for a specific user")
async def get_user_status(user_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await biometric_service.get_biometric_status(user_id)

@router.get("/telemetry", summary="Get aggregated biometric security events and telemetry")
async def get_telemetry(user: Dict[str, Any] = Depends(get_current_user)):
    return await biometric_service.get_security_telemetry()
