import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, desc
from app.core.config import settings
from app.core.database import get_session_maker
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token, create_refresh_token, decode_refresh_token
from app.core.exceptions import UnauthorizedError, ConflictError, NotFoundError
from app.core.permissions import Role
from app.models.user import User
from app.services.audit_service import audit_service
from app.services.biometric_service import biometric_service
from app.schemas.auth import LoginDto, RegisterDto

logger = logging.getLogger("CIRCUIT.AuthService")

class AuthService:
    async def seed_default_users(self):
        """Seed default enterprise accounts across all 5 roles in PostgreSQL."""
        seed_pwd = hash_password(settings.default_seed_password)
        now = datetime.now(timezone.utc)

        default_users = [
            {
                "user_id": "usr-circuit-01",
                "email": "circuit@circuit.gov",
                "password_hash": seed_pwd,
                "name": "CIRCUIT System Commander",
                "role": Role.ADMIN.value,
                "department": "Special Intelligence Operations",
                "badge_number": "HQ-CIRCUIT-01",
                "is_active": True,
                "status": "approved",
                "reviewed_by_admin": True,
            },
            {
                "user_id": "usr-inv-01",
                "email": "investigator@circuit.gov",
                "password_hash": seed_pwd,
                "name": "Lead Investigator Vikram Rao",
                "role": Role.INVESTIGATOR.value,
                "department": "Special Crime Intelligence Wing",
                "badge_number": "SCIW-4401",
                "is_active": True,
                "status": "approved",
                "reviewed_by_admin": True,
            },
            {
                "user_id": "usr-ana-01",
                "email": "analyst@circuit.gov",
                "password_hash": seed_pwd,
                "name": "Senior Analyst Maya Sen",
                "role": Role.ANALYST.value,
                "department": "Financial Forensics Unit",
                "badge_number": "FFU-1022",
                "is_active": True,
                "status": "approved",
                "reviewed_by_admin": True,
            },
            {
                "user_id": "usr-adm-01",
                "email": "admin@circuit.gov",
                "password_hash": seed_pwd,
                "name": "System Administrator",
                "role": Role.ADMIN.value,
                "department": "Operations Command",
                "badge_number": "ADMIN-0001",
                "is_active": True,
                "status": "approved",
                "reviewed_by_admin": True,
            },
            {
                "user_id": "usr-pol-01",
                "email": "police@circuit.gov",
                "password_hash": seed_pwd,
                "name": "Senior Inspector Vikram Shinde",
                "role": Role.POLICE_STATION.value,
                "department": "District Cyber Crime Wing",
                "badge_number": "PS-MUM-891",
                "district": "Mumbai South",
                "station_name": "Colaba Cyber Crime PS",
                "incharge_rank": "Senior Inspector / SHO",
                "incharge_name": "Inspector Vikram Shinde",
                "phone": "+912222019944",
                "is_active": True,
                "status": "approved",
                "reviewed_by_admin": True,
            },
            {
                "user_id": "usr-hr-01",
                "email": "hr@circuit.gov",
                "password_hash": seed_pwd,
                "name": "Personnel Manager Ananya Roy",
                "role": Role.HR.value,
                "department": "HR & Personnel Directorate",
                "badge_number": "HR-HQ-019",
                "is_active": True,
                "status": "approved",
                "reviewed_by_admin": True,
            },
        ]

        maker = get_session_maker()
        async with maker() as session:
            for u_data in default_users:
                res = await session.execute(select(User).where(User.email == u_data["email"]))
                existing = res.scalar_one_or_none()
                if not existing:
                    u = User(**u_data, created_at=now, updated_at=now)
                    session.add(u)
                else:
                    for k, v in u_data.items():
                        setattr(existing, k, v)
                    existing.updated_at = now
            await session.commit()
        logger.info("Default enterprise users synchronized in Database across all 5 roles.")

    async def demo_login(
        self,
        role: str = "investigator",
        ip: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """Instant demo login for developer role switching."""
        role_str = role.lower()
        target_email = (
            "analyst@circuit.gov" if role_str == "analyst"
            else "admin@circuit.gov" if role_str == "admin"
            else "police@circuit.gov" if role_str in ("police_station", "police")
            else "hr@circuit.gov" if role_str == "hr"
            else "investigator@circuit.gov"
        )

        maker = get_session_maker()
        user = None
        async with maker() as session:
            res = await session.execute(select(User).where(User.email == target_email))
            user = res.scalar_one_or_none()
            if not user:
                await self.seed_default_users()
                res = await session.execute(select(User).where(User.email == target_email))
                user = res.scalar_one_or_none()

        user_dict = user.to_dict() if user else {
            "id": f"usr-{role_str}",
            "userId": f"usr-{role_str}",
            "email": target_email,
            "name": f"Verified {role_str.capitalize()}",
            "role": role_str,
            "department": "Special Operations",
            "badgeNumber": "CIRCUIT-01",
        }

        user_id = user_dict.get("userId") or user_dict.get("id")
        name = user_dict.get("name")

        payload = {
            "sub": user_id,
            "email": target_email,
            "role": user_dict.get("role", role_str),
            "name": name,
            "stationName": user_dict.get("stationName"),
            "district": user_dict.get("district"),
            "inchargeRank": user_dict.get("inchargeRank"),
        }

        token = create_access_token(payload)
        refresh_token = create_refresh_token(payload)

        return {
            "accessToken": token,
            "refreshToken": refresh_token,
            "tokenType": "Bearer",
            "user": user_dict,
        }

    async def login(
        self,
        dto: LoginDto,
        ip: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """Validate user credentials and initiate 2FA biometric verification or direct session."""
        email_clean = dto.email.lower().strip()
        maker = get_session_maker()
        user = None
        async with maker() as session:
            res = await session.execute(select(User).where(User.email == email_clean))
            user = res.scalar_one_or_none()

        if not user:
            raise UnauthorizedError("Invalid email or password")

        pwd_matches = verify_password(dto.password, user.password_hash)
        if not pwd_matches:
            raise UnauthorizedError("Invalid email or password")

        if user.status == "pending_approval":
            raise UnauthorizedError("Your account has been submitted by HR and is currently pending Admin review.")

        if user.status == "rejected" or not user.is_active:
            raise UnauthorizedError("This account is deactivated or was rejected.")

        user_dict = user.to_dict()

        if settings.biometric_enabled:
            return await biometric_service.create_auth_challenge(user_dict, ip=ip, user_agent=user_agent)

        # Direct token issuance
        user_id = user_dict.get("userId") or str(user_dict.get("id"))
        payload = {
            "sub": user_id,
            "email": user_dict["email"],
            "role": user_dict.get("role", "investigator"),
            "name": user_dict.get("name", "Investigator"),
            "stationName": user_dict.get("stationName"),
            "district": user_dict.get("district"),
            "inchargeRank": user_dict.get("inchargeRank"),
        }

        token = create_access_token(payload)
        refresh_token = create_refresh_token(payload)

        await audit_service.log(
            user_id=user_id,
            user_email=user_dict["email"],
            action="LOGIN",
            resource_type="user",
            resource_id=user_id,
            details={"role": user_dict.get("role"), "stationName": user_dict.get("stationName")},
            ip_address=ip,
            user_agent=user_agent,
        )

        return {
            "accessToken": token,
            "refreshToken": refresh_token,
            "tokenType": "Bearer",
            "user": user_dict,
        }

    async def refresh_session(self, refresh_token: str) -> Dict[str, Any]:
        """Validate refresh token and issue new rotating access & refresh token pair."""
        try:
            payload = decode_refresh_token(refresh_token)
        except Exception as e:
            raise UnauthorizedError(f"Invalid or expired refresh token: {e}")

        user_id = payload.get("sub")
        email = payload.get("email")

        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(User).where((User.user_id == user_id) | (User.email == email)))
            user = res.scalar_one_or_none()
            if not user or not user.is_active:
                raise UnauthorizedError("User is no longer active.")
            user_dict = user.to_dict()

        new_payload = {
            "sub": user_dict.get("userId") or user.user_id,
            "email": user.email,
            "role": user.role,
            "name": user.name,
            "stationName": user.station_name,
            "district": user.district,
            "inchargeRank": user.incharge_rank,
        }

        new_access = create_access_token(new_payload)
        new_refresh = create_refresh_token(new_payload)

        return {
            "accessToken": new_access,
            "refreshToken": new_refresh,
            "tokenType": "Bearer",
            "user": user_dict,
        }


    async def register(
        self,
        dto: RegisterDto,
        ip: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """Register a new user account."""
        email_clean = dto.email.lower().strip()
        maker = get_session_maker()

        async with maker() as session:
            res = await session.execute(select(User).where(User.email == email_clean))
            existing = res.scalar_one_or_none()
            if existing:
                raise ConflictError("A user with this email address already exists")

            pwd_hash = hash_password(dto.password)
            is_hr = dto.createdByHr is True
            initial_status = "pending_approval" if is_hr else "approved"
            now = datetime.now(timezone.utc)
            user_id = f"usr_{uuid.uuid4().hex[:8]}"

            user = User(
                user_id=user_id,
                email=email_clean,
                password_hash=pwd_hash,
                name=dto.name.strip(),
                role=dto.role or Role.INVESTIGATOR.value,
                department=dto.department,
                badge_number=dto.badgeNumber,
                district=dto.district,
                station_name=dto.stationName,
                incharge_rank=dto.inchargeRank,
                incharge_name=dto.inchargeName,
                phone=dto.phone,
                status=initial_status,
                reviewed_by_admin=not is_hr,
                is_active=True,
                created_at=now,
                updated_at=now,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            user_dict = user.to_dict()

        await audit_service.log(
            user_id=user_id,
            user_email=email_clean,
            action="HR_ONBOARD_USER" if is_hr else "REGISTER_USER",
            resource_type="user",
            resource_id=user_id,
            details={"role": user_dict["role"], "status": user_dict["status"], "createdByHr": is_hr},
            ip_address=ip,
            user_agent=user_agent,
        )

        return user_dict

    async def get_pending_users(self) -> List[Dict[str, Any]]:
        """List users pending admin review."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(User).where(User.status == "pending_approval").order_by(desc(User.created_at))
            res = await session.execute(query)
            users = res.scalars().all()
            return [u.to_dict() for u in users]

    async def get_all_users(self) -> List[Dict[str, Any]]:
        """List all users."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(User).order_by(desc(User.created_at))
            res = await session.execute(query)
            users = res.scalars().all()
            return [u.to_dict() for u in users]

    async def approve_user(self, user_id: str, admin_user: Dict[str, Any]) -> Dict[str, Any]:
        """Admin approves HR-submitted user."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(
                select(User).where((User.user_id == user_id) | (User.email == user_id))
            )
            user = res.scalar_one_or_none()
            if not user:
                raise NotFoundError(f"User {user_id} not found")

            now = datetime.now(timezone.utc)
            user.status = "approved"
            user.is_active = True
            user.reviewed_by_admin = True
            user.updated_at = now
            await session.commit()
            await session.refresh(user)
            user_dict = user.to_dict()

        await audit_service.log(
            user_id=admin_user.get("userId") or "admin",
            user_email=admin_user.get("email") or "admin@circuit.gov",
            action="APPROVE_USER_ONBOARDING",
            resource_type="user",
            resource_id=user_id,
            details={"approvedUser": user_dict.get("email"), "role": user_dict.get("role")},
        )
        return user_dict

    async def reject_user(self, user_id: str, admin_user: Dict[str, Any]) -> Dict[str, Any]:
        """Admin rejects HR-submitted user."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(
                select(User).where((User.user_id == user_id) | (User.email == user_id))
            )
            user = res.scalar_one_or_none()
            if not user:
                raise NotFoundError(f"User {user_id} not found")

            now = datetime.now(timezone.utc)
            user.status = "rejected"
            user.is_active = False
            user.reviewed_by_admin = True
            user.updated_at = now
            await session.commit()
            await session.refresh(user)
            user_dict = user.to_dict()

        await audit_service.log(
            user_id=admin_user.get("userId") or "admin",
            user_email=admin_user.get("email") or "admin@circuit.gov",
            action="REJECT_USER_ONBOARDING",
            resource_type="user",
            resource_id=user_id,
            details={"rejectedUser": user_dict.get("email"), "role": user_dict.get("role")},
        )
        return user_dict

auth_service = AuthService()
