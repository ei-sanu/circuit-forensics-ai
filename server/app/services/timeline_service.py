"""Unified Multi-Modal Chronological Intelligence Timeline Service."""
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy import select, desc

from app.core.database import get_session_maker
from app.models.fir import FIR
from app.models.transaction import Transaction, Communication
from app.models.document import Document
from app.models.alert import Alert

logger = logging.getLogger("CIRCUIT.TimelineService")


class TimelineService:
    """Aggregates heterogeneous temporal events (FIRs, transactions, CDR, documents, alerts) into a unified chronological sequence."""

    async def get_case_timeline(
        self,
        case_id: Optional[str] = None,
        entity_id: Optional[str] = None,
        limit: int = 200,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        events: List[Dict[str, Any]] = []
        maker = get_session_maker()

        async with maker() as session:
            # 1. FIRs
            fir_query = select(FIR)
            if case_id:
                fir_query = fir_query.where((FIR.case_id == case_id) | (FIR.linked_case_id == case_id))
            fir_res = await session.execute(fir_query)
            for fir in fir_res.scalars().all():
                ts = fir.incident_date or fir.registration_date or fir.created_at
                events.append({
                    "id": f"EVT-FIR-{fir.fir_number}",
                    "eventType": "FIR_REGISTRATION",
                    "category": "legal_incident",
                    "title": f"FIR Registered: {fir.fir_number}",
                    "description": f"Registered at {fir.police_station}, {fir.district}. Complainant: {fir.complainant_name}. Sections: {', '.join(fir.sections or [])}",
                    "timestamp": ts.isoformat() if ts else None,
                    "severity": "high",
                    "caseId": fir.case_id,
                    "entities": fir.accused_names or [],
                    "evidenceId": fir.fir_number,
                    "metadata": {"policeStation": fir.police_station, "sections": fir.sections},
                })

            # 2. Transactions
            tx_query = select(Transaction)
            if case_id:
                tx_query = tx_query.where(Transaction.case_id == case_id)
            if entity_id:
                tx_query = tx_query.where((Transaction.from_id == entity_id) | (Transaction.to_id == entity_id))
            tx_res = await session.execute(tx_query)
            for tx in tx_res.scalars().all():
                events.append({
                    "id": f"EVT-TXN-{tx.transaction_id}",
                    "eventType": "FINANCIAL_TRANSACTION",
                    "category": "financial_flow",
                    "title": f"Transfer: ₹{tx.amount:,.2f} ({tx.channel})",
                    "description": f"Fund movement of ₹{tx.amount:,.2f} from {tx.from_id} to {tx.to_id} via {tx.channel}.",
                    "timestamp": tx.timestamp.isoformat() if tx.timestamp else None,
                    "severity": "critical" if tx.is_flagged else "low",
                    "caseId": tx.case_id,
                    "entities": [tx.from_id, tx.to_id],
                    "evidenceId": tx.transaction_id,
                    "metadata": {"isFlagged": tx.is_flagged, "amount": tx.amount, "channel": tx.channel},
                })

            # 3. Communications
            comm_query = select(Communication)
            if case_id:
                comm_query = comm_query.where(Communication.case_id == case_id)
            if entity_id:
                comm_query = comm_query.where(
                    (Communication.from_person_id == entity_id) | (Communication.to_person_id == entity_id)
                )
            comm_res = await session.execute(comm_query)
            for c in comm_res.scalars().all():
                is_nocturnal = c.timestamp and (0 <= c.timestamp.hour < 5)
                events.append({
                    "id": f"EVT-CDR-{c.communication_id}",
                    "eventType": "TELECOM_COMMUNICATION",
                    "category": "cdr_log",
                    "title": f"Call: {c.from_number} → {c.to_number} ({c.duration}s)",
                    "description": f"Voice/SMS contact recorded. Tower: {c.cell_tower_id or 'Unknown'}{' [NOCTURNAL]' if is_nocturnal else ''}",
                    "timestamp": c.timestamp.isoformat() if c.timestamp else None,
                    "severity": "medium" if is_nocturnal else "low",
                    "caseId": c.case_id,
                    "entities": [c.from_number, c.to_number],
                    "evidenceId": c.communication_id,
                    "metadata": {"durationSeconds": c.duration, "cellTower": c.cell_tower_id, "isNocturnal": is_nocturnal},
                })

            # 4. Documents
            doc_query = select(Document)
            if case_id:
                doc_query = doc_query.where(Document.case_id == case_id)
            doc_res = await session.execute(doc_query)
            for doc in doc_res.scalars().all():
                events.append({
                    "id": f"EVT-DOC-{doc.document_id}",
                    "eventType": "DOCUMENT_EVIDENCE",
                    "category": "evidentiary_file",
                    "title": f"Evidence Ingested: {doc.title}",
                    "description": f"File '{doc.file_name}' ({doc.file_size} bytes) processed with SHA-256 integrity verification.",
                    "timestamp": doc.created_at.isoformat() if doc.created_at else None,
                    "severity": "info",
                    "caseId": doc.case_id,
                    "entities": [e.get("label") for e in (doc.approved_entities or doc.extracted_entities or []) if isinstance(e, dict)],
                    "evidenceId": doc.document_id,
                    "metadata": {"sha256": (doc.meta_data or {}).get("sha256"), "status": doc.status},
                })

            # 5. Alerts
            alert_query = select(Alert)
            if case_id:
                alert_query = alert_query.where(Alert.case_id == case_id)
            alert_res = await session.execute(alert_query)
            for alt in alert_res.scalars().all():
                events.append({
                    "id": f"EVT-ALT-{alt.alert_id}",
                    "eventType": "ANOMALY_DETECTION",
                    "category": "ai_surveillance",
                    "title": f"Surveillance Alert: {alt.title}",
                    "description": alt.explanation or alt.description or "Automated anomaly signature detected.",
                    "timestamp": alt.created_at.isoformat() if alt.created_at else None,
                    "severity": alt.severity or "high",
                    "caseId": alt.case_id,
                    "entities": [e.get("label") for e in (alt.entities or []) if isinstance(e, dict)],
                    "evidenceId": alt.alert_id,
                    "metadata": {"confidence": alt.confidence, "detector": alt.detector_name},
                })

        # Sort all events chronologically (newest first)
        def parse_evt_time(e):
            t = e.get("timestamp")
            if not t:
                return datetime.min.replace(tzinfo=timezone.utc)
            try:
                return datetime.fromisoformat(t.replace("Z", "+00:00"))
            except Exception:
                return datetime.min.replace(tzinfo=timezone.utc)

        events.sort(key=parse_evt_time, reverse=True)
        return events[skip : skip + limit]


timeline_service = TimelineService()
