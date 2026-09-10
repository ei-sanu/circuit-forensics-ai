from typing import Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr, Field

class LoginDto(BaseModel):
    email: str = Field(..., description="Registered user email address")
    password: str = Field(..., min_length=1, description="Account password")

class DemoLoginDto(BaseModel):
    role: str = Field(default="investigator", description="Demo role to switch to")

class RegisterDto(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "investigator"
    department: Optional[str] = None
    badgeNumber: Optional[str] = None
    district: Optional[str] = None
    stationName: Optional[str] = None
    inchargeRank: Optional[str] = None
    inchargeName: Optional[str] = None
    phone: Optional[str] = None
    createdByHr: Optional[bool] = False

class UserResponseDto(BaseModel):
    id: str
    email: str
    name: str
    role: str
    department: Optional[str] = None
    badgeNumber: Optional[str] = None
    district: Optional[str] = None
    stationName: Optional[str] = None
    inchargeRank: Optional[str] = None
    status: Optional[str] = "approved"

class AuthResponseDto(BaseModel):
    accessToken: str
    tokenType: str = "Bearer"
    user: UserResponseDto
