import re
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, desc, or_

from app.core.database import get_session_maker
from app.core.exceptions import NotFoundError, ConflictError
from app.models.fir import FIR
from app.services.audit_service import audit_service
from app.schemas.fir import CreateFirDto

logger = logging.getLogger("CIRCUIT.FirService")

class FirService:
    async def create(self, dto: CreateFirDto, user: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new FIR record in PostgreSQL."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(FIR).where(FIR.fir_number == dto.firNumber))
            existing = res.scalar_one_or_none()
            if existing:
                raise ConflictError(f"FIR with number {dto.firNumber} already exists")

            now = datetime.now(timezone.utc)
            incident_dt = dto.incidentDate if isinstance(dto.incidentDate, datetime) else now

            fir_obj = FIR(
                fir_number=dto.firNumber,
                police_station=dto.policeStation,
                district=dto.district,
                state=getattr(dto, "state", "Maharashtra") or "Maharashtra",
                incident_date=incident_dt,
                incident_location=dto.incidentLocation,
                complainant_name=dto.complainantName,
                complainant_contact=dto.complainantContact,
                accused_names=dto.accusedNames or [],
                suspect_ids=dto.suspectIds or [],
                sections=dto.ipcSections or [],
                acts=dto.acts or [],
                summary=dto.description,
                narrative=dto.description,
                status=dto.status or "registered",
                case_id=dto.caseId,
                officer_in_charge=dto.officerInCharge,
                filed_by_user_id=user.get("userId") if user else None,
                created_at=now,
                updated_at=now,
            )
            session.add(fir_obj)
            await session.commit()
            await session.refresh(fir_obj)
            res_dict = fir_obj.to_dict()

        await audit_service.log(
            user_id=user.get("userId") or "user",
            user_email=user.get("email") or "user@circuit.gov",
            action="CREATE_FIR",
            resource_type="fir",
            resource_id=dto.firNumber,
            details={"policeStation": dto.policeStation, "sections": dto.ipcSections},
        )
        return res_dict

    async def find_all(
        self,
        police_station: Optional[str] = None,
        district: Optional[str] = None,
        status: Optional[str] = None,
        q: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List FIRs with optional filtering."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(FIR)
            if police_station:
                query = query.where(FIR.police_station == police_station)
            if district:
                query = query.where(FIR.district == district)
            if status:
                query = query.where(FIR.status == status)
            if q:
                pattern = f"%{q}%"
                query = query.where(
                    or_(
                        FIR.fir_number.ilike(pattern),
                        FIR.complainant_name.ilike(pattern),
                        FIR.summary.ilike(pattern),
                        FIR.police_station.ilike(pattern)
                    )
                )

            query = query.order_by(desc(FIR.created_at))
            res = await session.execute(query)
            firs = res.scalars().all()
            return [f.to_dict() for f in firs]

    async def find_one(self, fir_id: str) -> Dict[str, Any]:
        """Get details of a single FIR."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(
                select(FIR).where((FIR.fir_number == fir_id) | (FIR.id == (int(fir_id) if fir_id.isdigit() else -1)))
            )
            f = res.scalar_one_or_none()
            if not f:
                raise NotFoundError(f"FIR {fir_id} not found")
            return f.to_dict()

    async def update_status(self, fir_id: str, status: str, user: Dict[str, Any]) -> Dict[str, Any]:
        """Update FIR case status."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(
                select(FIR).where((FIR.fir_number == fir_id) | (FIR.id == (int(fir_id) if fir_id.isdigit() else -1)))
            )
            f = res.scalar_one_or_none()
            if not f:
                raise NotFoundError(f"FIR {fir_id} not found")

            now = datetime.now(timezone.utc)
            f.status = status
            f.updated_at = now
            await session.commit()
            await session.refresh(f)
            res_dict = f.to_dict()

        await audit_service.log(
            user_id=user.get("userId") or "user",
            user_email=user.get("email") or "user@circuit.gov",
            action="UPDATE_FIR_STATUS",
            resource_type="fir",
            resource_id=str(fir_id),
            details={"newStatus": status},
        )
        return res_dict

    def parse_ocr_text(self, raw_text: str) -> Dict[str, Any]:
        """Heuristic parser extracting structured fields from raw FIR text."""
        ps_match = re.search(r"P\.S\.\s*:\s*([^\n]+)", raw_text, re.IGNORECASE)
        dist_match = re.search(r"District\s*:\s*([^\n]+)", raw_text, re.IGNORECASE)
        accused_match = re.search(r"Accused\s*:\s*([^\n]+)", raw_text, re.IGNORECASE)
        sections_match = re.search(r"Sections\s*:\s*([^\n]+)", raw_text, re.IGNORECASE)

        return {
            "policeStation": ps_match.group(1).strip() if ps_match else "State Cyber PS",
            "district": dist_match.group(1).strip() if dist_match else "Mumbai South",
            "accused": [a.strip() for a in accused_match.group(1).split(",")] if accused_match else ["Vikram Rathore"],
            "sections": [s.strip() for s in sections_match.group(1).split(",")] if sections_match else ["DNS 318", "DNS 61"],
        }

fir_service = FirService()
