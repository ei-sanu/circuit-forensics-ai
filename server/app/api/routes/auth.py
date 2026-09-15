from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Request, status
from app.core.permissions import get_current_user, require_roles, Role
from app.services.auth_service import auth_service
from app.schemas.auth import LoginDto, DemoLoginDto, RegisterDto, ChangePasswordDto, AdminResetPasswordDto
from pydantic import BaseModel, Field

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RefreshTokenDto(BaseModel):
    refreshToken: str = Field(..., description="Valid 7-day JWT refresh token")

@router.post("/login", summary="Login and obtain JWT token or biometric challenge")
async def login(dto: LoginDto, request: Request):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await auth_service.login(dto, ip=ip, user_agent=user_agent)

@router.post("/demo-login", summary="Instant demo login for role switching")
async def demo_login(dto: DemoLoginDto, request: Request):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await auth_service.demo_login(dto.role, ip=ip, user_agent=user_agent)

@router.post("/refresh", summary="Rotate and refresh active JWT session tokens")
async def refresh_token(dto: RefreshTokenDto):
    return await auth_service.refresh_session(dto.refreshToken)

@router.post("/register", summary="Register a new user account")
async def register(dto: RegisterDto, request: Request):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await auth_service.register(dto, ip=ip, user_agent=user_agent)

@router.get("/me", summary="Get profile of current authenticated user")
async def get_profile(user: Dict[str, Any] = Depends(get_current_user)):
    return user

@router.get("/pending-users", summary="Get list of users submitted by HR pending Admin review")
async def get_pending_users(user: Dict[str, Any] = Depends(require_roles(Role.ADMIN, Role.HR))):
    return await auth_service.get_pending_users()

@router.get("/users", summary="Get all users across roles")
async def get_all_users(user: Dict[str, Any] = Depends(require_roles(Role.ADMIN, Role.HR))):
    return await auth_service.get_all_users()

@router.post("/approve-user/{user_id}", summary="Admin approves an HR submitted user account")
async def approve_user(user_id: str, user: Dict[str, Any] = Depends(require_roles(Role.ADMIN))):
    return await auth_service.approve_user(user_id, admin_user=user)

@router.post("/reject-user/{user_id}", summary="Admin rejects an HR submitted user account")
async def reject_user(user_id: str, user: Dict[str, Any] = Depends(require_roles(Role.ADMIN))):
    return await auth_service.reject_user(user_id, admin_user=user)

@router.post("/change-password", summary="Change current authenticated user's password in database")
async def change_password(
    dto: ChangePasswordDto,
    request: Request,
    user: Dict[str, Any] = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await auth_service.change_password(dto, user=user, ip=ip, user_agent=user_agent)

@router.post("/admin-reset-password/{user_id}", summary="Admin resets an officer password in database")
async def admin_reset_password(
    user_id: str,
    dto: AdminResetPasswordDto,
    request: Request,
    user: Dict[str, Any] = Depends(require_roles(Role.ADMIN))
):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await auth_service.admin_reset_password(user_id, dto, admin_user=user, ip=ip, user_agent=user_agent)

