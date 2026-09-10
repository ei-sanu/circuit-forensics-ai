from enum import Enum
from typing import List, Optional, Dict, Any, Callable
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.jwt import decode_access_token
security_bearer = HTTPBearer(auto_error=False)

class Role(str, Enum):
    ADMIN = "admin"
    INVESTIGATOR = "investigator"
    ANALYST = "analyst"
    POLICE_STATION = "police_station"
    HR = "hr"

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> Dict[str, Any]:
    """Extract and validate JWT token from Bearer header."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    
    # Support development demo tokens
    if token.startswith("demo-token-"):
        role_part = token.replace("demo-token-", "")
        role_mapped = (
            Role.ANALYST.value if "analyst" in role_part
            else Role.ADMIN.value if "admin" in role_part
            else Role.POLICE_STATION.value if "police" in role_part
            else Role.HR.value if "hr" in role_part
            else Role.INVESTIGATOR.value
        )
        return {
            "id": f"usr-{role_mapped}",
            "sub": f"usr-{role_mapped}",
            "userId": f"usr-{role_mapped}",
            "email": f"{role_mapped}@circuit.gov",
            "role": role_mapped,
            "name": f"Verified {role_mapped.capitalize()}",
            "department": "Special Crime Intelligence Wing",
            "badgeNumber": "SCIW-4401",
        }

    try:
        payload = decode_access_token(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token ({str(e)})",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub") or payload.get("id") or payload.get("userId")
    email = payload.get("email")

    if not email and not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Attach convenient id aliases
    payload["id"] = user_id
    payload["userId"] = user_id
    return payload

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> Optional[Dict[str, Any]]:
    """Extract token if present, otherwise returns None without error."""
    if not credentials or not credentials.credentials:
        return None
    try:
        return await get_current_user(credentials)
    except Exception:
        return None

def require_roles(*allowed_roles: str) -> Callable:
    """Dependency factory ensuring current user possesses one of the authorized roles."""
    normalized_roles = [r.value if isinstance(r, Role) else r.lower() for r in allowed_roles]

    async def role_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = str(user.get("role", "")).lower()
        if user_role not in normalized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: user role '{user_role}' lacks required permissions [{', '.join(normalized_roles)}]",
            )
        return user

    return role_checker
