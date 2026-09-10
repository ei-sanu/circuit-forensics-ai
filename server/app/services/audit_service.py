import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, desc
from app.core.database import get_session_maker
from app.models.audit import AuditLog

logger = logging.getLogger("CIRCUIT.AuditService")

class AuditService:
    async def log(
        self,
        user_id: str,
        user_email: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Record an immutable compliance audit event in PostgreSQL."""
        entry = AuditLog(
            user_id=str(user_id or "system"),
            user_email=str(user_email or "system@circuit.gov"),
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id or "general"),
            details=details or {},
            ip_address=ip_address,
            created_at=datetime.now(timezone.utc),
        )
        try:
            maker = get_session_maker()
            async with maker() as session:
                session.add(entry)
                await session.commit()
                await session.refresh(entry)
                return entry.to_dict()
        except Exception as e:
            logger.warning(f"Could not persist audit log to DB ({e})")
            return {
                "userId": user_id,
                "userEmail": user_email,
                "action": action,
                "resourceType": resource_type,
                "resourceId": resource_id,
                "details": details or {},
                "ipAddress": ip_address,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }

    async def find_all(self, limit: int = 100, skip: int = 0) -> List[Dict[str, Any]]:
        """Retrieve recent immutable audit logs from PostgreSQL."""
        try:
            maker = get_session_maker()
            async with maker() as session:
                query = select(AuditLog).order_by(desc(AuditLog.created_at)).offset(skip).limit(limit)
                res = await session.execute(query)
                logs = res.scalars().all()
                return [log.to_dict() for log in logs]
        except Exception as e:
            logger.warning(f"Audit log query error ({e})")
            return []

audit_service = AuditService()
