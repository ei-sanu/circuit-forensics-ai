import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, func, desc

from app.core.database import get_session_maker
from app.core.exceptions import NotFoundError
from app.models.alert import Alert
from app.models.entity import Entity
from app.models.relationship import Relationship
from app.models.transaction import Transaction, Communication
from app.services.audit_service import audit_service
from app.ml.anomaly_engine import AnomalyEngine
from app.ml.schemas import EntityNode, GraphEdge, TransactionRecord, CommunicationRecord

logger = logging.getLogger("CIRCUIT.AlertService")

class AlertService:
    async def seed_demo_alerts(self):
        """Seed initial suspicious activity and anomaly alerts in PostgreSQL."""
        maker = get_session_maker()
        async with maker() as session:
            cnt_res = await session.execute(select(func.count()).select_from(Alert))
            count = cnt_res.scalar() or 0

            if count < 5:
                now = datetime.now(timezone.utc)
                demo_alerts = [
                    {
                        "alert_id": "ALT-2026-001",
                        "detector_name": "Hawala Layering Detector",
                        "severity": "critical",
                        "title": "Rapid Sequential Mule Dispersal",
                        "explanation": "Account P-0003 transferred ₹18,00,000 to logistics shell entity within 12 minutes of receiving liquidity.",
                        "confidence": 0.98,
                        "status": "open",
                        "case_id": "CR-2026-00124",
                        "entities": [{"id": "P-0003", "label": "Karan Malhotra"}, {"id": "O-0001", "label": "NorthStar Logistics"}],
                        "evidence_ids": ["TXN-001"],
                        "methodology": "Graph cycle & temporal window analysis",
                    },
                    {
                        "alert_id": "ALT-2026-002",
                        "detector_name": "Cross-Syndicate Communication Bridge",
                        "severity": "high",
                        "title": "Encrypted Burner Handshake",
                        "explanation": "Primary suspect P-0001 placed 18 outgoing calls to Dubai bullion broker P-0004 across 48 hours.",
                        "confidence": 0.95,
                        "status": "investigating",
                        "case_id": "CR-2026-00842",
                        "entities": [{"id": "P-0001", "label": "Vikram Rathore"}, {"id": "P-0004", "label": "Rashid Al-Mansoor"}],
                        "evidence_ids": ["COMM-001"],
                        "methodology": "Cell tower & call duration graph correlation",
                    },
                    {
                        "alert_id": "ALT-2026-003",
                        "detector_name": "Inter-State Smuggling Corridors",
                        "severity": "high",
                        "title": "ANPR Route Clustering Discrepancy",
                        "explanation": "Container vehicle V-0003 tracked along unauthorized forest checkpoints bypassing commercial toll plazas.",
                        "confidence": 0.91,
                        "status": "open",
                        "case_id": "CR-2026-00315",
                        "entities": [{"id": "V-0003", "label": "TN04EF5544"}, {"id": "P-0006", "label": "Dhanush 'Red' Gounder"}],
                        "evidence_ids": [],
                        "methodology": "Spatial trajectory clustering",
                    },
                ]

                for a_data in demo_alerts:
                    res = await session.execute(select(Alert).where(Alert.alert_id == a_data["alert_id"]))
                    existing = res.scalar_one_or_none()
                    if not existing:
                        session.add(Alert(**a_data, created_at=now, updated_at=now))
                    else:
                        for k, v in a_data.items():
                            setattr(existing, k, v)
                        existing.updated_at = now
                await session.commit()
                logger.info("Demo alerts synchronized in PostgreSQL.")

    async def find_all(
        self,
        case_id: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List pattern alerts from PostgreSQL."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(Alert)
            if case_id:
                query = query.where(Alert.case_id == case_id)
            if severity:
                query = query.where(Alert.severity == severity)
            if status:
                query = query.where(Alert.status == status)

            query = query.order_by(desc(Alert.created_at))
            res = await session.execute(query)
            alerts = res.scalars().all()
            return [a.to_dict() for a in alerts]

    async def find_one(self, alert_id: str) -> Dict[str, Any]:
        """Get single alert details."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(Alert).where(Alert.alert_id == alert_id))
            a = res.scalar_one_or_none()
            if not a:
                raise NotFoundError(f"Alert {alert_id} not found")
            return a.to_dict()

    async def update_status(self, alert_id: str, status: str, user: Dict[str, Any]) -> Dict[str, Any]:
        """Update alert workflow status."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(select(Alert).where(Alert.alert_id == alert_id))
            a = res.scalar_one_or_none()
            if not a:
                raise NotFoundError(f"Alert {alert_id} not found")

            now = datetime.now(timezone.utc)
            a.status = status
            a.updated_at = now
            await session.commit()
            await session.refresh(a)
            res_dict = a.to_dict()

        await audit_service.log(
            user_id=user.get("userId") or "user",
            user_email=user.get("email") or "user@circuit.gov",
            action="UPDATE_ALERT_STATUS",
            resource_type="alert",
            resource_id=alert_id,
            details={"newStatus": status},
        )
        return res_dict

    async def trigger_refresh(self, case_id: str, user: Dict[str, Any]) -> Dict[str, Any]:
        """Re-run 10 anomaly detection algorithms across case dataset in-process."""
        maker = get_session_maker()
        async with maker() as session:
            # Fetch graph data
            e_res = await session.execute(select(Entity))
            entities = e_res.scalars().all()

            r_query = select(Relationship)
            if case_id:
                r_query = r_query.where(Relationship.case_id == case_id)
            r_res = await session.execute(r_query)
            relationships = r_res.scalars().all()

            t_query = select(Transaction)
            if case_id:
                t_query = t_query.where(Transaction.case_id == case_id)
            t_res = await session.execute(t_query)
            txns = t_res.scalars().all()

            c_query = select(Communication)
            if case_id:
                c_query = c_query.where(Communication.case_id == case_id)
            c_res = await session.execute(c_query)
            comms = c_res.scalars().all()

            nodes = [EntityNode(id=e.entity_id, label=e.name, entity_type=e.type, risk_flag=e.risk_flag, properties=e.properties or {}) for e in entities]
            edges = [GraphEdge(source=r.source_id, target=r.target_id, rel_type=r.rel_type, count=int(r.weight or 1), total_amount=float(r.total_amount or 0.0), confidence=float(r.confidence or 0.95)) for r in relationships]
            txn_records = [TransactionRecord(id=t.transaction_id, from_type=t.from_type or "person", from_id=t.from_id, to_type=t.to_type or "organization", to_id=t.to_id, amount=t.amount, timestamp=t.timestamp.isoformat() if t.timestamp else "", channel=t.channel, is_flagged=t.is_flagged) for t in txns]
            comm_records = [CommunicationRecord(id=c.communication_id, from_number=c.from_number, to_number=c.to_number, timestamp=c.timestamp.isoformat() if c.timestamp else "", duration_seconds=c.duration, from_person_id=c.from_person_id, to_person_id=c.to_person_id) for c in comms]

            engine = AnomalyEngine(nodes, edges, txn_records, comm_records)
            detected_alerts = engine.run_all()

            now = datetime.now(timezone.utc)
            for d in detected_alerts:
                al_res = await session.execute(select(Alert).where(Alert.alert_id == d.id))
                if not al_res.scalar_one_or_none():
                    new_al = Alert(
                        alert_id=d.id,
                        case_id=case_id or "CR-2026-00124",
                        detector_name=d.detector_name,
                        severity=d.severity,
                        title=d.title,
                        explanation=d.explanation,
                        confidence=d.confidence,
                        status="open",
                        entities=d.entities,
                        evidence_ids=d.evidence_ids,
                        methodology=d.methodology,
                        created_at=now,
                        updated_at=now,
                    )
                    session.add(new_al)
            await session.commit()

        alerts = await self.find_all(case_id=case_id)

        await audit_service.log(
            user_id=user.get("userId") or "user",
            user_email=user.get("email") or "user@circuit.gov",
            action="REFRESH_ANOMALY_DETECTORS",
            resource_type="alert",
            resource_id=case_id or "global",
            details={"refreshedAlertsCount": len(alerts)},
        )

        return {
            "success": True,
            "caseId": case_id,
            "totalAlerts": len(alerts),
            "alerts": alerts,
        }

alert_service = AlertService()
