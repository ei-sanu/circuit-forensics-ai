"""Telecommunications and CDR (Call Detail Record) Intelligence Service."""
import io
import csv
import json
import secrets
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dateutil import parser as date_parser
from sqlalchemy import select, desc, or_

from app.core.database import get_session_maker
from app.core.exceptions import NotFoundError, BadRequestError
from app.models.transaction import Communication
from app.services.audit_service import audit_service
from app.ml.ner_extractor import normalize_phone

logger = logging.getLogger("CIRCUIT.CommunicationService")


class CommunicationService:
    """Manages CDR intelligence logs, nocturnal pattern monitoring, and telecom network aggregation."""

    async def create(self, data: Dict[str, Any], user: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a single telecommunication / CDR record."""
        maker = get_session_maker()
        async with maker() as session:
            comm_id = data.get("communication_id") or data.get("communicationId") or f"CDR-{secrets.token_hex(4).upper()}"
            from_num = normalize_phone(data.get("from_number") or data.get("fromNumber", ""))
            to_num = normalize_phone(data.get("to_number") or data.get("toNumber", ""))

            ts = data.get("timestamp")
            if isinstance(ts, str):
                try:
                    dt = date_parser.parse(ts)
                except Exception:
                    dt = datetime.now(timezone.utc)
            elif isinstance(ts, datetime):
                dt = ts
            else:
                dt = datetime.now(timezone.utc)

            comm_obj = Communication(
                communication_id=comm_id,
                case_id=data.get("case_id") or data.get("caseId"),
                from_number=from_num,
                to_number=to_num,
                from_person_id=data.get("from_person_id") or data.get("fromPersonId"),
                to_person_id=data.get("to_person_id") or data.get("toPersonId"),
                type=data.get("type") or data.get("commType", "voice_call"),
                duration=int(data.get("duration") or data.get("durationSeconds", 0)),
                timestamp=dt,
                cell_tower_id=data.get("cell_tower_id") or data.get("cellTowerId"),
                content_summary=data.get("content_summary") or data.get("contentSummary"),
            )
            session.add(comm_obj)
            await session.commit()
            await session.refresh(comm_obj)
            res = comm_obj.to_dict()

        if user:
            await audit_service.log(
                user_id=user.get("userId") or "user",
                user_email=user.get("email") or "user@circuit.gov",
                action="CREATE_COMMUNICATION",
                resource_type="communication",
                resource_id=comm_id,
                details={"fromNumber": from_num, "toNumber": to_num, "duration": comm_obj.duration},
            )
        return res

    async def find_all(
        self,
        case_id: Optional[str] = None,
        phone_number: Optional[str] = None,
        from_number: Optional[str] = None,
        to_number: Optional[str] = None,
        comm_type: Optional[str] = None,
        cell_tower_id: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        """List and filter CDR communication records."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(Communication)
            if case_id:
                query = query.where(Communication.case_id == case_id)
            if phone_number:
                norm_p = normalize_phone(phone_number)
                query = query.where(
                    or_(Communication.from_number.contains(norm_p), Communication.to_number.contains(norm_p))
                )
            if from_number:
                query = query.where(Communication.from_number.contains(normalize_phone(from_number)))
            if to_number:
                query = query.where(Communication.to_number.contains(normalize_phone(to_number)))
            if comm_type:
                query = query.where(Communication.type == comm_type)
            if cell_tower_id:
                query = query.where(Communication.cell_tower_id == cell_tower_id)

            query = query.order_by(desc(Communication.timestamp)).offset(skip).limit(limit)
            res = await session.execute(query)
            records = res.scalars().all()
            return [r.to_dict() for r in records]

    async def find_one(self, communication_id: str) -> Dict[str, Any]:
        """Fetch a single CDR record by identifier."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(
                select(Communication).where(Communication.communication_id == communication_id)
            )
            c = res.scalar_one_or_none()
            if not c:
                raise NotFoundError(f"Communication '{communication_id}' not found.")
            return c.to_dict()

    async def import_batch(
        self,
        file_bytes: bytes,
        file_name: str,
        case_id: Optional[str] = None,
        user: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Batch ingest telecom CDR logs from CSV or JSON file."""
        raw_items: List[Dict[str, Any]] = []
        lower_name = file_name.lower()

        if lower_name.endswith(".json"):
            try:
                parsed = json.loads(file_bytes.decode("utf-8"))
                raw_items = parsed if isinstance(parsed, list) else parsed.get("communications", [])
            except Exception as e:
                raise BadRequestError(f"Invalid JSON CDR format: {e}")
        else:
            try:
                decoded = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                decoded = file_bytes.decode("latin-1", errors="ignore")

            delimiter = "\t" if "\t" in decoded[:200] else ","
            reader = csv.DictReader(io.StringIO(decoded), delimiter=delimiter)
            for row in reader:
                raw_items.append(row)

        if not raw_items:
            raise BadRequestError("No CDR records identified in uploaded file.")

        imported: List[Communication] = []
        maker = get_session_maker()
        nocturnal_count = 0

        async with maker() as session:
            for item in raw_items:
                comm_id = (
                    item.get("communication_id")
                    or item.get("communicationId")
                    or item.get("id")
                    or item.get("CallID")
                    or f"CDR-{secrets.token_hex(4).upper()}"
                )
                from_num = normalize_phone(
                    item.get("from_number")
                    or item.get("fromNumber")
                    or item.get("caller")
                    or item.get("A_Party")
                    or item.get("from")
                    or "UNKNOWN"
                )
                to_num = normalize_phone(
                    item.get("to_number")
                    or item.get("toNumber")
                    or item.get("callee")
                    or item.get("B_Party")
                    or item.get("to")
                    or "UNKNOWN"
                )

                raw_dur = item.get("duration") or item.get("durationSeconds") or item.get("Duration") or 0
                try:
                    duration = int(float(str(raw_dur).strip()))
                except Exception:
                    duration = 0

                ts_raw = item.get("timestamp") or item.get("Timestamp") or item.get("datetime") or item.get("date")
                try:
                    dt = date_parser.parse(ts_raw) if ts_raw else datetime.now(timezone.utc)
                except Exception:
                    dt = datetime.now(timezone.utc)

                if 0 <= dt.hour < 5:
                    nocturnal_count += 1

                comm_obj = Communication(
                    communication_id=str(comm_id),
                    case_id=case_id or item.get("case_id") or item.get("caseId"),
                    from_number=from_num,
                    to_number=to_num,
                    from_person_id=item.get("from_person_id") or item.get("fromPersonId"),
                    to_person_id=item.get("to_person_id") or item.get("toPersonId"),
                    type=item.get("type") or item.get("commType") or "voice_call",
                    duration=duration,
                    timestamp=dt,
                    cell_tower_id=item.get("cell_tower_id") or item.get("cellTowerId") or item.get("CellID"),
                    content_summary=item.get("content_summary") or item.get("contentSummary"),
                )
                session.add(comm_obj)
                imported.append(comm_obj)

            await session.commit()

        if user:
            await audit_service.log(
                user_id=user.get("userId") or "user",
                user_email=user.get("email") or "user@circuit.gov",
                action="IMPORT_COMMUNICATIONS_BATCH",
                resource_type="communication",
                resource_id=case_id or "global",
                details={
                    "fileName": file_name,
                    "importedCount": len(imported),
                    "nocturnalCount": nocturnal_count,
                },
            )

        return {
            "success": True,
            "fileName": file_name,
            "importedCount": len(imported),
            "nocturnalCount": nocturnal_count,
            "caseId": case_id,
            "message": f"Successfully ingested {len(imported)} CDR records ({nocturnal_count} nocturnal calls detected).",
        }

    async def get_stats(self, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate telecom network and diurnal/nocturnal calling matrix."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(Communication)
            if case_id:
                query = query.where(Communication.case_id == case_id)

            res = await session.execute(query)
            records = res.scalars().all()

            if not records:
                return {
                    "totalRecords": 0,
                    "totalDurationMinutes": 0.0,
                    "averageDurationSeconds": 0.0,
                    "nocturnalCallCount": 0,
                    "nocturnalRatio": 0.0,
                    "topCallers": [],
                    "topReceivers": [],
                    "frequentPairs": [],
                    "cellTowers": {},
                }

            total_dur_sec = sum(r.duration for r in records)
            nocturnal_calls = 0
            callers: Dict[str, int] = {}
            receivers: Dict[str, int] = {}
            pairs: Dict[str, int] = {}
            towers: Dict[str, int] = {}

            for r in records:
                if r.timestamp and 0 <= r.timestamp.hour < 5:
                    nocturnal_calls += 1

                callers[r.from_number] = callers.get(r.from_number, 0) + 1
                receivers[r.to_number] = receivers.get(r.to_number, 0) + 1
                pair_key = f"{r.from_number} ↔ {r.to_number}"
                pairs[pair_key] = pairs.get(pair_key, 0) + 1

                if r.cell_tower_id:
                    towers[r.cell_tower_id] = towers.get(r.cell_tower_id, 0) + 1

            sorted_callers = sorted(callers.items(), key=lambda x: x[1], reverse=True)[:5]
            sorted_receivers = sorted(receivers.items(), key=lambda x: x[1], reverse=True)[:5]
            sorted_pairs = sorted(pairs.items(), key=lambda x: x[1], reverse=True)[:5]

            return {
                "totalRecords": len(records),
                "totalDurationMinutes": round(total_dur_sec / 60.0, 1),
                "averageDurationSeconds": round(total_dur_sec / len(records), 1) if records else 0.0,
                "nocturnalCallCount": nocturnal_calls,
                "nocturnalRatio": round(nocturnal_calls / len(records), 3) if records else 0.0,
                "topCallers": [{"phone": k, "count": v} for k, v in sorted_callers],
                "topReceivers": [{"phone": k, "count": v} for k, v in sorted_receivers],
                "frequentPairs": [{"pair": k, "callCount": v} for k, v in sorted_pairs],
                "cellTowers": towers,
            }


communication_service = CommunicationService()
