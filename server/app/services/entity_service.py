import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, func, desc, or_

from app.core.database import get_session_maker
from app.core.exceptions import NotFoundError, ConflictError
from app.models.entity import Entity
from app.services.audit_service import audit_service
from app.schemas.entity import CreateEntityDto

logger = logging.getLogger("CIRCUIT.EntityService")

class EntityService:
    async def seed_demo_entities(self):
        """Seed default intelligence entities across cases in PostgreSQL."""
        maker = get_session_maker()
        async with maker() as session:
            cnt_res = await session.execute(select(func.count()).select_from(Entity))
            count = cnt_res.scalar() or 0

            if count < 10:
                now = datetime.now(timezone.utc)
                entities_to_seed = [
                    # Case CR-2026-00124 (Operation Nightfall)
                    {"entity_id": "P-0001", "type": "person", "name": "Vikram Rathore", "aliases": ["Vicky", "VR"], "risk_flag": True, "influence_score": 92.5, "cases": ["CR-2026-00124"], "properties": {"designation": "Primary Syndicate Coordinator", "nationality": "Indian"}},
                    {"entity_id": "P-0002", "type": "person", "name": "Sunil Verma", "aliases": ["SV", "Pandit"], "risk_flag": True, "influence_score": 84.2, "cases": ["CR-2026-00124"], "properties": {"designation": "Mule & Cash Transit Courier"}},
                    {"entity_id": "P-0003", "type": "person", "name": "Karan Malhotra", "aliases": ["KM", "Broker"], "risk_flag": True, "influence_score": 76.0, "cases": ["CR-2026-00124"], "properties": {"designation": "Financial Broker & Pass-through Controller"}},
                    {"entity_id": "O-0001", "type": "organization", "name": "NorthStar Logistics Pvt Ltd", "aliases": ["NorthStar"], "risk_flag": True, "influence_score": 78.9, "cases": ["CR-2026-00124"], "properties": {"jurisdiction": "Mumbai", "regNo": "U72900MH2021PTC332211"}},
                    {"entity_id": "PH-0001", "type": "phone", "name": "+919876543210", "aliases": [], "risk_flag": True, "influence_score": 65.0, "cases": ["CR-2026-00124"], "properties": {"carrier": "Airtel", "circle": "Delhi-NCR"}},
                    {"entity_id": "V-0001", "type": "vehicle", "name": "MH02CD9988", "aliases": [], "risk_flag": True, "influence_score": 55.0, "cases": ["CR-2026-00124"], "properties": {"make": "Toyota", "model": "Fortuner", "color": "Black"}},

                    # Case CR-2026-00842 (Operation Goldcrest)
                    {"entity_id": "P-0004", "type": "person", "name": "Rashid Al-Mansoor", "aliases": ["Sheikh Rashid", "The Goldsmith"], "risk_flag": True, "influence_score": 94.0, "cases": ["CR-2026-00842"], "properties": {"designation": "Gulf Bullion Broker & Token Issuer", "nationality": "Emirati"}},
                    {"entity_id": "P-0005", "type": "person", "name": "Rajesh Singhania", "aliases": ["Sethji", "RS Vault"], "risk_flag": True, "influence_score": 88.5, "cases": ["CR-2026-00842"], "properties": {"designation": "Karol Bagh Vault Operator"}},
                    {"entity_id": "O-0002", "type": "organization", "name": "Apex Bullion DMCC", "aliases": ["Apex Bullion"], "risk_flag": True, "influence_score": 89.0, "cases": ["CR-2026-00842"], "properties": {"jurisdiction": "Dubai", "license": "DMCC-77189"}},
                    {"entity_id": "O-0003", "type": "organization", "name": "Singhania Jewellers & Safe Vaults", "aliases": ["SJ Vaults"], "risk_flag": True, "influence_score": 82.0, "cases": ["CR-2026-00842"], "properties": {"jurisdiction": "Delhi", "regNo": "DL-KB-2018-091"}},
                    {"entity_id": "PH-0002", "type": "phone", "name": "+971501234567", "aliases": [], "risk_flag": True, "influence_score": 70.0, "cases": ["CR-2026-00842"], "properties": {"carrier": "Etisalat", "circle": "UAE-Dubai"}},
                    {"entity_id": "V-0002", "type": "vehicle", "name": "DL01AB1122", "aliases": [], "risk_flag": True, "influence_score": 58.0, "cases": ["CR-2026-00842"], "properties": {"make": "Mercedes", "model": "E-Class", "color": "Silver"}},

                    # Case CR-2026-00315 (Operation Red Sand)
                    {"entity_id": "P-0006", "type": "person", "name": "Dhanush 'Red' Gounder", "aliases": ["Red Gounder", "Forester"], "risk_flag": True, "influence_score": 91.0, "cases": ["CR-2026-00315"], "properties": {"designation": "Forest Transit Boss", "nationality": "Indian"}},
                    {"entity_id": "P-0007", "type": "person", "name": "Karthik Subramanian", "aliases": ["KS", "Harbor Log"], "risk_flag": True, "influence_score": 79.5, "cases": ["CR-2026-00315"], "properties": {"designation": "Port Logistics Clearing Agent"}},
                    {"entity_id": "O-0004", "type": "organization", "name": "Coastal Freight Carriers Ltd", "aliases": ["Coastal Freight"], "risk_flag": True, "influence_score": 81.0, "cases": ["CR-2026-00315"], "properties": {"jurisdiction": "Chennai", "portTerminal": "Ennore / Port of Chennai"}},
                    {"entity_id": "PH-0003", "type": "phone", "name": "+919444123456", "aliases": [], "risk_flag": True, "influence_score": 62.0, "cases": ["CR-2026-00315"], "properties": {"carrier": "Jio", "circle": "Tamil Nadu"}},
                    {"entity_id": "V-0003", "type": "vehicle", "name": "TN04EF5544", "aliases": [], "risk_flag": True, "influence_score": 60.0, "cases": ["CR-2026-00315"], "properties": {"make": "Tata", "model": "Signa Multi-Axle Container Truck", "color": "Brown/Yellow"}},

                    # Case CR-2026-00489 (Project Phantom)
                    {"entity_id": "P-0008", "type": "person", "name": "Devendra 'Ghost' Joshi", "aliases": ["Ghost", "DJ Crypt"], "risk_flag": True, "influence_score": 93.0, "cases": ["CR-2026-00489"], "properties": {"designation": "Darknet Escrow & Mule Architect", "nationality": "Indian"}},
                    {"entity_id": "P-0009", "type": "person", "name": "Rhea Kapoor", "aliases": ["CryptoQueen", "RK OTC"], "risk_flag": True, "influence_score": 86.0, "cases": ["CR-2026-00489"], "properties": {"designation": "OTC Cash-Crypto Clearing Desk"}},
                    {"entity_id": "O-0005", "type": "organization", "name": "PayNexus Tech Solutions LLP", "aliases": ["PayNexus"], "risk_flag": True, "influence_score": 87.5, "cases": ["CR-2026-00489"], "properties": {"jurisdiction": "Bengaluru", "pgLicenseStatus": "Under ED Scrutiny"}},
                    {"entity_id": "PH-0004", "type": "phone", "name": "+919988776655", "aliases": [], "risk_flag": True, "influence_score": 68.0, "cases": ["CR-2026-00489"], "properties": {"carrier": "Vi", "circle": "Karnataka"}},
                    {"entity_id": "V-0004", "type": "vehicle", "name": "KA05MN3322", "aliases": [], "risk_flag": True, "influence_score": 52.0, "cases": ["CR-2026-00489"], "properties": {"make": "BMW", "model": "3-Series", "color": "White"}},

                    # Case CR-2026-00712 (Operation Eastern Corridor)
                    {"entity_id": "P-0010", "type": "person", "name": "Mukesh 'Bhaiya' Yadav", "aliases": ["Mukesh Bhaiya", "Parcel King"], "risk_flag": True, "influence_score": 85.0, "cases": ["CR-2026-00712"], "properties": {"designation": "Rail Freight Contraband Master", "nationality": "Indian"}},
                    {"entity_id": "P-0011", "type": "person", "name": "Ramesh Paswan", "aliases": ["RP Rail"], "risk_flag": True, "influence_score": 74.0, "cases": ["CR-2026-00712"], "properties": {"designation": "Patna Junction Loading Supervisor"}},
                    {"entity_id": "O-0006", "type": "organization", "name": "Magadh Express Cargo Packers", "aliases": ["Magadh Cargo"], "risk_flag": True, "influence_score": 77.0, "cases": ["CR-2026-00712"], "properties": {"jurisdiction": "Patna", "license": "BR-PT-2016-044"}},
                    {"entity_id": "V-0005", "type": "vehicle", "name": "BR01GA7788", "aliases": [], "risk_flag": True, "influence_score": 50.0, "cases": ["CR-2026-00712"], "properties": {"make": "Mahindra", "model": "Bolero Maxi Truck", "color": "White"}},
                ]

                for e_data in entities_to_seed:
                    res = await session.execute(select(Entity).where(Entity.entity_id == e_data["entity_id"]))
                    existing = res.scalar_one_or_none()
                    if not existing:
                        e_obj = Entity(**e_data, created_at=now, updated_at=now)
                        session.add(e_obj)
                    else:
                        for k, v in e_data.items():
                            setattr(existing, k, v)
                        existing.updated_at = now
                await session.commit()
                logger.info("Demo entities synchronized in PostgreSQL.")

    async def create(self, dto: CreateEntityDto, user: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new entity in the registry."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(Entity).where(Entity.entity_id == dto.entityId))
            existing = res.scalar_one_or_none()
            if existing:
                raise ConflictError(f"Entity with ID {dto.entityId} already exists")

            now = datetime.now(timezone.utc)
            e_obj = Entity(
                entity_id=dto.entityId,
                name=dto.label,
                type=dto.type,
                risk_flag=dto.riskFlag or False,
                influence_score=getattr(dto, "influenceScore", 0.0) or 0.0,
                properties=dto.properties or {},
                aliases=dto.aliases or [],
                cases=dto.cases or [],
                created_at=now,
                updated_at=now,
            )
            session.add(e_obj)
            await session.commit()
            await session.refresh(e_obj)
            res_dict = e_obj.to_dict()

        await audit_service.log(
            user_id=user.get("userId") or "user",
            user_email=user.get("email") or "user@circuit.gov",
            action="CREATE_ENTITY",
            resource_type="entity",
            resource_id=dto.entityId,
            details={"label": dto.label, "type": dto.type, "riskFlag": dto.riskFlag},
        )
        return res_dict

    async def find_all(
        self,
        type: Optional[str] = None,
        risk: Optional[bool] = None,
        case_id: Optional[str] = None,
        q: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        """Query entities with filters from PostgreSQL."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(Entity)

            if type:
                query = query.where(Entity.type == type)
            if risk is not None:
                query = query.where(Entity.risk_flag == risk)
            if q:
                pattern = f"%{q}%"
                query = query.where(or_(Entity.name.ilike(pattern), Entity.entity_id.ilike(pattern)))

            query = query.order_by(desc(Entity.influence_score)).offset(skip).limit(limit)
            res = await session.execute(query)
            entities = res.scalars().all()

            results = []
            for e in entities:
                d = e.to_dict()
                if case_id:
                    # Filter by case if requested
                    cases_list = d.get("cases") or []
                    if case_id not in cases_list:
                        continue
                results.append(d)

            return results

    async def find_one(self, entity_id: str) -> Dict[str, Any]:
        """Retrieve full entity profile."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(Entity).where(Entity.entity_id == entity_id))
            e = res.scalar_one_or_none()
            if not e:
                raise NotFoundError(f"Entity {entity_id} not found")
            return e.to_dict()

entity_service = EntityService()
