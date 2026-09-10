"""Service-to-service authentication middleware and dependency."""
import secrets
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.config import settings

API_KEY_HEADER = APIKeyHeader(name="X-Internal-Service-Key", auto_error=False)


async def verify_service_key(api_key: str | None = Security(API_KEY_HEADER)) -> bool:
    """Verifies that incoming requests have the valid internal service key."""
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing required X-Internal-Service-Key header",
        )
    
    # Constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(api_key, settings.INTERNAL_SERVICE_SECRET):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid internal service key",
        )
    return True
