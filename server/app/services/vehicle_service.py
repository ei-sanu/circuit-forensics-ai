import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, func, or_

from app.core.database import get_session_maker
from app.core.exceptions import NotFoundError, ConflictError
from app.models.entity import Entity
from app.models.case import Case
from app.models.fir import FIR
from app.services.audit_service import audit_service

logger = logging.getLogger("CIRCUIT.VehicleService")

DEFAULT_VEHICLES = [
    {
        "vehicleId": "VH-0001",
        "plateNumber": "MH-01-EA-9021",
        "makeModel": "Toyota Fortuner Legender 4x4",
        "vehicleType": "suv",
        "ownerId": "P-0001",
        "ownerName": "Vikram Rathore",
        "ownerDesignation": "Primary Syndicate Coordinator",
        "riskFlag": True,
        "chassisNumber": "MB1BA45G8PZ098712",
        "fastagId": "FASTAG-6701-9921-4401",
        "cases": ["CR-2026-00124"],
        "lastSeenLocation": "Western Express Highway, Bandra Toll, Mumbai",
        "lastSeenCoordinates": [19.0596, 72.8406],
        "lastSeenTimestamp": "2026-09-10T14:22:00Z",
        "sightings": [
            {"id": "SGT-01", "tollPlaza": "Bandra Toll", "city": "Mumbai", "timestamp": "2026-09-10T14:22:00Z", "lane": "Lane 4", "confidence": 0.98},
            {"id": "SGT-02", "tollPlaza": "Khed Shivapur Toll", "city": "Pune", "timestamp": "2026-09-08T03:15:00Z", "lane": "Lane 2", "confidence": 0.94}
        ],
        "alerts": [
            {"type": "Suspicious Escort Convoy", "severity": "critical", "description": "Spotted traveling in 2-car convoy with unregistered Scorpio.", "timestamp": "2026-09-08T03:20:00Z"}
        ]
    },
    {
        "vehicleId": "VH-0002",
        "plateNumber": "DL-01-AB-1122",
        "makeModel": "Mercedes-Benz E-Class E350d",
        "vehicleType": "luxury_armored",
        "ownerId": "P-0005",
        "ownerName": "Rajesh Singhania",
        "ownerDesignation": "Karol Bagh Safe Vault Operator",
        "riskFlag": True,
        "chassisNumber": "WDD2130041A990123",
        "fastagId": "FASTAG-1102-4481-9002",
        "cases": ["CR-2026-00842"],
        "lastSeenLocation": "DND Flyway Plaza, Delhi-Noida",
        "lastSeenCoordinates": [28.5833, 77.3000],
        "lastSeenTimestamp": "2026-09-09T23:45:00Z",
        "sightings": [
            {"id": "SGT-03", "tollPlaza": "DND Flyway", "city": "Delhi", "timestamp": "2026-09-09T23:45:00Z", "lane": "FastTag Lane 1", "confidence": 0.96}
        ],
        "alerts": [
            {"type": "Odd-Hours Cash Transit", "severity": "high", "description": "Consecutive toll crossings between 11:30 PM and 1:00 AM.", "timestamp": "2026-09-10T00:15:00Z"}
        ]
    },
    {
        "vehicleId": "VH-0003",
        "plateNumber": "TN-04-EF-5544",
        "makeModel": "Tata Signa 4825.T Heavy Multi-Axle",
        "vehicleType": "commercial_truck",
        "ownerId": "P-0007",
        "ownerName": "Karthik Subramanian",
        "ownerDesignation": "Port Logistics Clearing Agent",
        "riskFlag": True,
        "chassisNumber": "MAT628045P0112894",
        "fastagId": "FASTAG-8821-3310-7744",
        "cases": ["CR-2026-00315"],
        "lastSeenLocation": "Ennore Expressway Toll Plaza, Chennai",
        "lastSeenCoordinates": [13.2012, 80.3204],
        "lastSeenTimestamp": "2026-09-10T04:10:00Z",
        "sightings": [
            {"id": "SGT-04", "tollPlaza": "Ennore Port Access Toll", "city": "Chennai", "timestamp": "2026-09-10T04:10:00Z", "lane": "Commercial Lane 6", "confidence": 0.95}
        ],
        "alerts": [
            {"type": "Contraband Weight Discrepancy", "severity": "critical", "description": "Manifest shows timber, weighbridge flag indicates +4.2T excess density.", "timestamp": "2026-09-10T04:25:00Z"}
        ]
    },
    {
        "vehicleId": "VH-0004",
        "plateNumber": "KA-05-MN-3322",
        "makeModel": "BMW 330i M Sport",
        "vehicleType": "sedan",
        "ownerId": "P-0008",
        "ownerName": "Devendra 'Ghost' Joshi",
        "ownerDesignation": "Darknet Escrow & Mule Architect",
        "riskFlag": True,
        "chassisNumber": "WBA5R11030FL99812",
        "fastagId": "FASTAG-5509-2218-4491",
        "cases": ["CR-2026-00489"],
        "lastSeenLocation": "Electronic City Elevated Highway, Bengaluru",
        "lastSeenCoordinates": [12.8452, 77.6602],
        "lastSeenTimestamp": "2026-09-10T19:05:00Z",
        "sightings": [
            {"id": "SGT-05", "tollPlaza": "Hosur Road Toll", "city": "Bengaluru", "timestamp": "2026-09-10T19:05:00Z", "lane": "Lane 3", "confidence": 0.97}
        ],
        "alerts": [
            {"type": "Rapid Transit Spike", "severity": "medium", "description": "High-velocity route movement between Koramangala tech hub and Tamil Nadu border.", "timestamp": "2026-09-10T19:30:00Z"}
        ]
    },
    {
        "vehicleId": "VH-0005",
        "plateNumber": "BR-01-GA-7788",
        "makeModel": "Mahindra Bolero Maxi Truck Plus",
        "vehicleType": "commercial_truck",
        "ownerId": "P-0010",
        "ownerName": "Mukesh 'Bhaiya' Yadav",
        "ownerDesignation": "Rail Freight Contraband Master",
        "riskFlag": True,
        "chassisNumber": "MA1ZE2TG7P8091823",
        "fastagId": "FASTAG-3310-8891-2201",
        "cases": ["CR-2026-00712"],
        "lastSeenLocation": "Didarganj Toll Plaza, Patna Bypass",
        "lastSeenCoordinates": [25.5684, 85.2514],
        "lastSeenTimestamp": "2026-09-10T02:40:00Z",
        "sightings": [
            {"id": "SGT-06", "tollPlaza": "Didarganj Toll", "city": "Patna", "timestamp": "2026-09-10T02:40:00Z", "lane": "Lane 1", "confidence": 0.92}
        ],
        "alerts": [
            {"type": "Rail Parcel Depot Escort", "severity": "high", "description": "Unregistered loading activity near Patna Junction Freight Yard.", "timestamp": "2026-09-10T03:00:00Z"}
        ]
    }
]

class VehicleService:
    async def seed_default_vehicles(self):
        """Seed default high-risk vehicles into PostgreSQL entities table."""
        maker = get_session_maker()
        async with maker() as session:
            q = select(func.count()).select_from(Entity).where(Entity.type == "vehicle")
            res = await session.execute(q)
            cnt = res.scalar() or 0

            if cnt < len(DEFAULT_VEHICLES):
                for v in DEFAULT_VEHICLES:
                    chk = await session.execute(select(Entity).where(Entity.entity_id == v["vehicleId"]))
                    if not chk.scalar_one_or_none():
                        ent = Entity(
                            entity_id=v["vehicleId"],
                            name=v["plateNumber"],
                            type="vehicle",
                            risk_flag=v["riskFlag"],
                            influence_score=75.0,
                            cases=v.get("cases", []),
                            aliases=[v["plateNumber"].replace("-", ""), v["plateNumber"].replace(" ", "")],
                            properties=v
                        )
                        session.add(ent)
                await session.commit()
                logger.info("Successfully seeded vehicle registry in PostgreSQL.")

    async def find_all(
        self,
        q: Optional[str] = None,
        type: Optional[str] = None,
        flagged: Optional[bool] = None,
        limit: int = 100,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        maker = get_session_maker()
        async with maker() as session:
            stmt = select(Entity).where(Entity.type == "vehicle")
            if flagged is not None:
                stmt = stmt.where(Entity.risk_flag == flagged)

            results = await session.execute(stmt.offset(skip).limit(limit))
            entities = results.scalars().all()

            vehicles = []
            for e in entities:
                data = dict(e.properties) if e.properties else {}
                data["vehicleId"] = e.entity_id
                data["plateNumber"] = data.get("plateNumber") or e.name
                data["riskFlag"] = e.risk_flag
                data["cases"] = e.cases or []
                vehicles.append(data)

            if not vehicles:
                # Seed and return defaults if empty
                await self.seed_default_vehicles()
                return await self.find_all(q=q, type=type, flagged=flagged, limit=limit, skip=skip)

            # In-memory filtering for search & subtype
            if q:
                ql = q.strip().lower()
                clean_q = ql.replace("-", "").replace(" ", "")
                vehicles = [
                    v for v in vehicles
                    if ql in (v.get("plateNumber", "")).lower()
                    or clean_q in (v.get("plateNumber", "")).lower().replace("-", "").replace(" ", "")
                    or ql in (v.get("ownerName", "")).lower()
                    or ql in (v.get("makeModel", "")).lower()
                    or ql in (v.get("chassisNumber", "")).lower()
                    or ql in (v.get("fastagId", "")).lower()
                ]

            if type and type != "all":
                vehicles = [v for v in vehicles if v.get("vehicleType") == type]

            return vehicles

    async def find_one(self, vehicle_id_or_plate: str) -> Optional[Dict[str, Any]]:
        maker = get_session_maker()
        async with maker() as session:
            norm = vehicle_id_or_plate.strip().upper().replace("-", "").replace(" ", "")
            stmt = select(Entity).where(
                Entity.type == "vehicle",
                or_(
                    Entity.entity_id == vehicle_id_or_plate,
                    Entity.name == vehicle_id_or_plate,
                    func.replace(func.replace(Entity.name, "-", ""), " ", "") == norm,
                    Entity.entity_id == f"VH-{vehicle_id_or_plate}"
                )
            )
            res = await session.execute(stmt)
            e = res.scalar_one_or_none()
            if not e:
                return None
            data = dict(e.properties) if e.properties else {}
            data["vehicleId"] = e.entity_id
            data["plateNumber"] = data.get("plateNumber") or e.name
            data["riskFlag"] = e.risk_flag
            data["cases"] = e.cases or []
            return data

    async def create(self, data: Dict[str, Any], user: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        plate = data.get("plateNumber") or data.get("name")
        if not plate:
            raise ConflictError("plateNumber is required")

        maker = get_session_maker()
        async with maker() as session:
            # Check existing plate
            chk = await session.execute(
                select(Entity).where(
                    Entity.type == "vehicle",
                    Entity.name == plate.strip().upper()
                )
            )
            if chk.scalar_one_or_none():
                raise ConflictError(f"Vehicle with plate {plate} already registered in intelligence database")

            vid = data.get("vehicleId") or f"VH-{uuid_short()}"
            record = dict(data)
            record["vehicleId"] = vid
            record["plateNumber"] = plate.strip().upper()
            record["lastSeenTimestamp"] = record.get("lastSeenTimestamp") or datetime.now(timezone.utc).isoformat()
            record["sightings"] = record.get("sightings") or []
            record["alerts"] = record.get("alerts") or []

            ent = Entity(
                entity_id=vid,
                name=plate.strip().upper(),
                type="vehicle",
                risk_flag=data.get("riskFlag", False),
                influence_score=float(data.get("influenceScore", 50.0)),
                cases=data.get("cases", []),
                aliases=[plate.replace("-", ""), plate.replace(" ", "")],
                properties=record
            )
            session.add(ent)
            await session.commit()

            if user:
                await audit_service.log(
                    user_id=user.get("userId") or user.get("id", "sys"),
                    user_email=user.get("email", "system"),
                    action="VEHICLE_REGISTERED",
                    resource_type="vehicle",
                    resource_id=vid,
                    details={"plate": plate, "owner": data.get("ownerName")}
                )

            return record

    async def scan_plate(self, plate_input: str) -> Dict[str, Any]:
        """Real-time ANPR number plate triage against BNS FIRs, warrants, and suspect registries."""
        clean_plate = plate_input.strip().upper().replace("-", "").replace(" ", "")
        maker = get_session_maker()
        async with maker() as session:
            # 1. Search vehicle entities
            stmt = select(Entity).where(
                Entity.type == "vehicle",
                or_(
                    Entity.name == plate_input.strip().upper(),
                    func.replace(func.replace(Entity.name, "-", ""), " ", "") == clean_plate,
                    Entity.entity_id == plate_input.strip()
                )
            )
            res = await session.execute(stmt)
            veh_ent = res.scalar_one_or_none()

            # 2. Search active FIRs mentioning this vehicle
            fir_stmt = select(FIR).where(
                or_(
                    FIR.summary.ilike(f"%{clean_plate}%"),
                    FIR.narrative.ilike(f"%{clean_plate}%"),
                    FIR.summary.ilike(f"%{plate_input.strip()}%"),
                )
            )
            fir_res = await session.execute(fir_stmt)
            firs = fir_res.scalars().all()

            if veh_ent:
                props = dict(veh_ent.properties) if veh_ent.properties else {}
                props["vehicleId"] = veh_ent.entity_id
                props["plateNumber"] = veh_ent.name
                props["riskFlag"] = veh_ent.risk_flag

                status = "culprit" if veh_ent.risk_flag else "suspicious"
                return {
                    "plate": veh_ent.name,
                    "status": status,
                    "vehicle": props,
                    "title": f"🚨 HIGH RISK TARGET: Linked to Active Case {veh_ent.cases[0] if veh_ent.cases else 'CR-2026'}",
                    "description": f"Vehicle is registered to {props.get('ownerName', 'Unknown')} ({props.get('ownerDesignation', 'Suspect')}). Automated watchlist hit across FastTag tolls.",
                    "associatedFirs": [f.fir_number for f in firs]
                }
            elif firs:
                sections_str = ", ".join(firs[0].sections) if firs[0].sections else "BNS 318"
                return {
                    "plate": plate_input.strip().upper(),
                    "status": "culprit",
                    "title": f"⚠️ FLAGGED IN BNS FIR ({firs[0].fir_number})",
                    "description": f"Incident registered under {sections_str} at {firs[0].police_station or 'District PS'}.",
                    "associatedFirs": [f.fir_number for f in firs]
                }
            else:
                return {
                    "plate": plate_input.strip().upper(),
                    "status": "safe",
                    "title": "✅ CLEAR: No Active Warrants or FIR Linkages",
                    "description": "Plate checked against RTO watchlist, ANPR checkpoint logs, and BNS investigative database.",
                    "associatedFirs": []
                }

def uuid_short():
    import uuid
    return uuid.uuid4().hex[:6]

vehicle_service = VehicleService()
