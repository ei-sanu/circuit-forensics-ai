import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, func, desc

from app.core.database import get_session_maker
from app.core.exceptions import NotFoundError, ConflictError
from app.models.case import Case
from app.models.entity import Entity
from app.services.audit_service import audit_service
from app.schemas.case import CreateCaseDto, UpdateCaseDto

logger = logging.getLogger("CIRCUIT.CaseService")

class CaseService:
    async def seed_demo_cases(self):
        """Seed default enterprise investigation cases if database is empty."""
        maker = get_session_maker()
        async with maker() as session:
            cnt_res = await session.execute(select(func.count()).select_from(Case))
            count = cnt_res.scalar() or 0

            if count < 5:
                now = datetime.now(timezone.utc)
                cases_to_seed = [
                    {
                        "case_number": "CR-2026-00124",
                        "title": "Operation Nightfall",
                        "summary": "Multi-jurisdiction syndicate investigation involving rapid transfer chains, shell logistics entities, and burner communications.",
                        "status": "active",
                        "priority": "critical",
                        "assigned_investigators": ["Vikram Rao", "Maya Sen"],
                        "tags": ["flagship", "hawala", "shell_company", "illicit_transit"],
                        "entity_ids": ["P-0001", "P-0002", "P-0003", "O-0001", "PH-0001", "V-0001"],
                    },
                    {
                        "case_number": "CR-2026-00842",
                        "title": "Operation Goldcrest: Dubai-Delhi Hawala Corridor",
                        "summary": "Cross-border gold bullion factoring, tokenized cash handshakes across Deira Gold Souk and Karol Bagh vaults.",
                        "status": "active",
                        "priority": "critical",
                        "assigned_investigators": ["Maya Sen", "Rohan Mathur"],
                        "tags": ["hawala", "bullion", "dubai_corridor", "money_laundering"],
                        "entity_ids": ["P-0004", "P-0005", "O-0002", "O-0003", "PH-0002", "V-0002"],
                    },
                    {
                        "case_number": "CR-2026-00315",
                        "title": "Operation Red Sand: Inter-State Smuggling Syndicate",
                        "summary": "Illicit interstate timber and precious mineral transport network moving through South India transit corridors to Ennore port.",
                        "status": "active",
                        "priority": "high",
                        "assigned_investigators": ["Vikram Rao", "Kavita Nair"],
                        "tags": ["smuggling", "port_export", "anpr_tracking", "interstate"],
                        "entity_ids": ["P-0006", "P-0007", "O-0004", "PH-0003", "V-0003"],
                    },
                    {
                        "case_number": "CR-2026-00489",
                        "title": "Project Phantom: Cyber-Fin Mule Network",
                        "summary": "Rogue payment gateways, layered UPI routing, and crypto OTC cash conversions across NCR and Western hubs.",
                        "status": "active",
                        "priority": "high",
                        "assigned_investigators": ["Aman Gupta", "Maya Sen"],
                        "tags": ["cyber_fraud", "mule_accounts", "crypto_otc", "upi_layering"],
                        "entity_ids": ["P-0008", "P-0009", "O-0005", "PH-0004", "V-0004"],
                    },
                    {
                        "case_number": "CR-2026-00712",
                        "title": "Operation Eastern Corridor: Rail Cargo Smuggling",
                        "summary": "Inland railway freight parcel contraband routing from Bihar to Eastern border checkpoints and foreign transit nodes.",
                        "status": "active",
                        "priority": "medium",
                        "assigned_investigators": ["Sanjay Jha"],
                        "tags": ["rail_transit", "border_post", "cargo_fraud"],
                        "entity_ids": ["P-0010", "P-0011", "O-0006", "V-0005"],
                    },
                ]
                for c_data in cases_to_seed:
                    res = await session.execute(select(Case).where(Case.case_number == c_data["case_number"]))
                    existing = res.scalar_one_or_none()
                    if not existing:
                        c_obj = Case(**c_data, created_at=now, updated_at=now)
                        session.add(c_obj)
                    else:
                        for k, v in c_data.items():
                            setattr(existing, k, v)
                        existing.updated_at = now
                await session.commit()
                logger.info("Demo cases synchronized in PostgreSQL.")

    async def create(self, dto: CreateCaseDto, user: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new case in PostgreSQL."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(Case).where(Case.case_number == dto.caseNumber))
            existing = res.scalar_one_or_none()
            if existing:
                raise ConflictError(f"Case with number {dto.caseNumber} already exists")

            now = datetime.now(timezone.utc)
            c_obj = Case(
                case_number=dto.caseNumber,
                title=dto.title,
                summary=getattr(dto, "description", None) or getattr(dto, "summary", None),
                priority=dto.priority or "medium",
                status=dto.status or "active",
                assigned_investigators=getattr(dto, "leadInvestigators", []) or [],
                tags=dto.tags or [],
                entity_ids=getattr(dto, "entityIds", []) or [],
                created_at=now,
                updated_at=now,
            )
            session.add(c_obj)
            await session.commit()
            await session.refresh(c_obj)
            res_dict = c_obj.to_dict()

        await audit_service.log(
            user_id=user.get("userId") or "user",
            user_email=user.get("email") or "user@circuit.gov",
            action="CREATE_CASE",
            resource_type="case",
            resource_id=dto.caseNumber,
            details={"title": dto.title, "priority": dto.priority},
        )
        return res_dict

    async def find_all(self, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        """List all investigative cases from PostgreSQL."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(Case).order_by(desc(Case.created_at)).offset(skip).limit(limit)
            res = await session.execute(query)
            cases = res.scalars().all()
            return [c.to_dict() for c in cases]

    async def find_one(self, case_number: str) -> Dict[str, Any]:
        """Get details of a specific case."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(Case).where(Case.case_number == case_number))
            c = res.scalar_one_or_none()
            if not c:
                raise NotFoundError(f"Case {case_number} not found")
            return c.to_dict()

    async def update(self, case_number: str, dto: UpdateCaseDto, user: Dict[str, Any]) -> Dict[str, Any]:
        """Update case details."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(Case).where(Case.case_number == case_number))
            c = res.scalar_one_or_none()
            if not c:
                raise NotFoundError(f"Case {case_number} not found")

            now = datetime.now(timezone.utc)
            if dto.title is not None:
                c.title = dto.title
            if hasattr(dto, "description") and dto.description is not None:
                c.summary = dto.description
            if dto.priority is not None:
                c.priority = dto.priority
            if dto.status is not None:
                c.status = dto.status
            if hasattr(dto, "leadInvestigators") and dto.leadInvestigators is not None:
                c.assigned_investigators = dto.leadInvestigators
            if dto.tags is not None:
                c.tags = dto.tags
            if hasattr(dto, "entityIds") and dto.entityIds is not None:
                c.entity_ids = dto.entityIds
            c.updated_at = now

            await session.commit()
            await session.refresh(c)
            res_dict = c.to_dict()

        await audit_service.log(
            user_id=user.get("userId") or "user",
            user_email=user.get("email") or "user@circuit.gov",
            action="UPDATE_CASE",
            resource_type="case",
            resource_id=case_number,
            details=dto.model_dump(exclude_unset=True),
        )
        return res_dict

    async def link_entity(self, case_number: str, entity_id: str, user: Dict[str, Any]) -> Dict[str, Any]:
        """Link an entity to a case."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(Case).where(Case.case_number == case_number))
            c = res.scalar_one_or_none()
            if not c:
                raise NotFoundError(f"Case {case_number} not found")

            existing_entities = list(c.entity_ids or [])
            if entity_id not in existing_entities:
                existing_entities.append(entity_id)
                c.entity_ids = existing_entities
                c.updated_at = datetime.now(timezone.utc)

            # Also update the entity's case references
            e_res = await session.execute(select(Entity).where(Entity.entity_id == entity_id))
            e = e_res.scalar_one_or_none()
            if e:
                existing_cases = list(e.cases or [])
                if case_number not in existing_cases:
                    existing_cases.append(case_number)
                    e.cases = existing_cases
                    e.updated_at = datetime.now(timezone.utc)

            await session.commit()
            await session.refresh(c)
            res_dict = c.to_dict()

        await audit_service.log(
            user_id=user.get("userId") or "user",
            user_email=user.get("email") or "user@circuit.gov",
            action="LINK_ENTITY_TO_CASE",
            resource_type="case",
            resource_id=case_number,
            details={"entityId": entity_id},
        )
        return res_dict

case_service = CaseService()
