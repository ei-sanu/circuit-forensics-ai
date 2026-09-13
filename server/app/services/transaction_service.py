"""Transaction and Financial Intelligence Service."""
import io
import csv
import json
import secrets
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dateutil import parser as date_parser
from sqlalchemy import select, desc, func

from app.core.database import get_session_maker
from app.core.exceptions import NotFoundError, BadRequestError
from app.models.transaction import Transaction
from app.services.audit_service import audit_service

logger = logging.getLogger("CIRCUIT.TransactionService")


class TransactionService:
    """Manages transactional records, batch ledger ingestion, and financial analytics."""

    async def create(self, data: Dict[str, Any], user: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a single financial transaction record."""
        maker = get_session_maker()
        async with maker() as session:
            tx_id = data.get("transaction_id") or data.get("transactionId") or f"TXN-{secrets.token_hex(4).upper()}"
            amount = float(data.get("amount", 0.0))
            is_flagged = bool(data.get("is_flagged") or data.get("isFlagged") or amount >= 400000.0)

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

            tx_obj = Transaction(
                transaction_id=tx_id,
                case_id=data.get("case_id") or data.get("caseId"),
                from_id=data.get("from_id") or data.get("fromId") or "UNKNOWN_SRC",
                to_id=data.get("to_id") or data.get("toId") or "UNKNOWN_DST",
                from_type=data.get("from_type") or data.get("fromType", "person"),
                to_type=data.get("to_type") or data.get("toType", "organization"),
                from_account=data.get("from_account") or data.get("fromAccount"),
                to_account=data.get("to_account") or data.get("toAccount"),
                amount=amount,
                currency=data.get("currency", "INR"),
                timestamp=dt,
                channel=data.get("channel", "NEFT"),
                is_flagged=is_flagged,
                flags=data.get("flags") or (["HIGH_VALUE_THRESHOLD"] if amount >= 400000.0 else []),
                status=data.get("status", "completed"),
            )
            session.add(tx_obj)
            await session.commit()
            await session.refresh(tx_obj)
            res = tx_obj.to_dict()

        if user:
            await audit_service.log(
                user_id=user.get("userId") or "user",
                user_email=user.get("email") or "user@circuit.gov",
                action="CREATE_TRANSACTION",
                resource_type="transaction",
                resource_id=tx_id,
                details={"amount": amount, "from": tx_obj.from_id, "to": tx_obj.to_id},
            )
        return res

    async def find_all(
        self,
        case_id: Optional[str] = None,
        from_id: Optional[str] = None,
        to_id: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        channel: Optional[str] = None,
        is_flagged: Optional[bool] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        """List and filter transactions."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(Transaction)
            if case_id:
                query = query.where(Transaction.case_id == case_id)
            if from_id:
                query = query.where(Transaction.from_id == from_id)
            if to_id:
                query = query.where(Transaction.to_id == to_id)
            if min_amount is not None:
                query = query.where(Transaction.amount >= min_amount)
            if max_amount is not None:
                query = query.where(Transaction.amount <= max_amount)
            if channel:
                query = query.where(Transaction.channel == channel)
            if is_flagged is not None:
                query = query.where(Transaction.is_flagged == is_flagged)

            query = query.order_by(desc(Transaction.timestamp)).offset(skip).limit(limit)
            res = await session.execute(query)
            records = res.scalars().all()
            return [r.to_dict() for r in records]

    async def find_one(self, transaction_id: str) -> Dict[str, Any]:
        """Fetch a single transaction record by identifier."""
        maker = get_session_maker()
        async with maker() as session:
            res = await session.execute(
                select(Transaction).where(Transaction.transaction_id == transaction_id)
            )
            t = res.scalar_one_or_none()
            if not t:
                raise NotFoundError(f"Transaction '{transaction_id}' not found.")
            return t.to_dict()

    async def import_batch(
        self,
        file_bytes: bytes,
        file_name: str,
        case_id: Optional[str] = None,
        user: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Batch ingest bank transactions from CSV or JSON file."""
        imported_records: List[Transaction] = []
        raw_items: List[Dict[str, Any]] = []

        lower_name = file_name.lower()
        if lower_name.endswith(".json"):
            try:
                parsed = json.loads(file_bytes.decode("utf-8"))
                raw_items = parsed if isinstance(parsed, list) else parsed.get("transactions", [])
            except Exception as e:
                raise BadRequestError(f"Invalid JSON file format: {e}")
        else:
            # Parse as CSV/TSV
            try:
                decoded = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                decoded = file_bytes.decode("latin-1", errors="ignore")

            delimiter = "\t" if "\t" in decoded[:200] else ","
            reader = csv.DictReader(io.StringIO(decoded), delimiter=delimiter)
            for row in reader:
                raw_items.append(row)

        if not raw_items:
            raise BadRequestError("No transactional records found in uploaded file.")

        maker = get_session_maker()
        total_amount = 0.0
        flagged_count = 0

        async with maker() as session:
            for item in raw_items:
                # Flexible column mapping
                tx_id = (
                    item.get("transaction_id")
                    or item.get("transactionId")
                    or item.get("id")
                    or item.get("TxnID")
                    or f"TXN-{secrets.token_hex(4).upper()}"
                )
                from_id = (
                    item.get("from_id")
                    or item.get("fromId")
                    or item.get("sender")
                    or item.get("from")
                    or item.get("Source")
                    or "UNKNOWN_SRC"
                )
                to_id = (
                    item.get("to_id")
                    or item.get("toId")
                    or item.get("receiver")
                    or item.get("to")
                    or item.get("Destination")
                    or "UNKNOWN_DST"
                )

                raw_amt = item.get("amount") or item.get("Amount") or item.get("amt") or 0.0
                try:
                    amount = float(str(raw_amt).replace(",", "").replace("₹", "").replace("$", "").strip())
                except Exception:
                    amount = 0.0

                total_amount += amount
                channel = item.get("channel") or item.get("Channel") or item.get("type") or "NEFT"
                
                # Check flags
                flags = []
                if amount >= 400000.0:
                    flags.append("HIGH_VALUE_CTR")
                if 35000.0 <= amount < 50000.0:
                    flags.append("SUB_THRESHOLD_STRUCTURING")

                is_flagged = len(flags) > 0 or str(item.get("is_flagged", "")).lower() in ("true", "1")
                if is_flagged:
                    flagged_count += 1

                ts_raw = item.get("timestamp") or item.get("Timestamp") or item.get("date") or item.get("Date")
                try:
                    dt = date_parser.parse(ts_raw) if ts_raw else datetime.now(timezone.utc)
                except Exception:
                    dt = datetime.now(timezone.utc)

                tx = Transaction(
                    transaction_id=str(tx_id),
                    case_id=case_id or item.get("case_id") or item.get("caseId"),
                    from_id=str(from_id),
                    to_id=str(to_id),
                    from_type=item.get("from_type", "account"),
                    to_type=item.get("to_type", "account"),
                    from_account=item.get("from_account") or item.get("fromAccount"),
                    to_account=item.get("to_account") or item.get("toAccount"),
                    amount=amount,
                    currency=item.get("currency", "INR"),
                    timestamp=dt,
                    channel=channel,
                    is_flagged=is_flagged,
                    flags=flags,
                    status="completed",
                )
                session.add(tx)
                imported_records.append(tx)

            await session.commit()

        if user:
            await audit_service.log(
                user_id=user.get("userId") or "user",
                user_email=user.get("email") or "user@circuit.gov",
                action="IMPORT_TRANSACTIONS_BATCH",
                resource_type="transaction",
                resource_id=case_id or "global",
                details={
                    "fileName": file_name,
                    "importedCount": len(imported_records),
                    "totalAmount": total_amount,
                    "flaggedCount": flagged_count,
                },
            )

        return {
            "success": True,
            "fileName": file_name,
            "importedCount": len(imported_records),
            "totalVolume": round(total_amount, 2),
            "flaggedCount": flagged_count,
            "caseId": case_id,
            "message": f"Successfully ingested {len(imported_records)} transactions ({flagged_count} flagged suspicious).",
        }

    async def get_stats(self, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Aggregate statistical metrics across transactions."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(Transaction)
            if case_id:
                query = query.where(Transaction.case_id == case_id)

            res = await session.execute(query)
            records = res.scalars().all()

            if not records:
                return {
                    "totalVolume": 0.0,
                    "transactionCount": 0,
                    "flaggedCount": 0,
                    "flaggedRatio": 0.0,
                    "averageAmount": 0.0,
                    "topSenders": [],
                    "topReceivers": [],
                    "channelBreakdown": {},
                }

            total_vol = sum(t.amount for t in records)
            flagged = sum(1 for t in records if t.is_flagged)
            channels: Dict[str, int] = {}
            senders: Dict[str, float] = {}
            receivers: Dict[str, float] = {}

            for t in records:
                channels[t.channel] = channels.get(t.channel, 0) + 1
                senders[t.from_id] = senders.get(t.from_id, 0.0) + t.amount
                receivers[t.to_id] = receivers.get(t.to_id, 0.0) + t.amount

            sorted_senders = sorted(senders.items(), key=lambda x: x[1], reverse=True)[:5]
            sorted_receivers = sorted(receivers.items(), key=lambda x: x[1], reverse=True)[:5]

            return {
                "totalVolume": round(total_vol, 2),
                "transactionCount": len(records),
                "flaggedCount": flagged,
                "flaggedRatio": round(flagged / len(records), 3) if records else 0.0,
                "averageAmount": round(total_vol / len(records), 2) if records else 0.0,
                "topSenders": [{"id": k, "volume": round(v, 2)} for k, v in sorted_senders],
                "topReceivers": [{"id": k, "volume": round(v, 2)} for k, v in sorted_receivers],
                "channelBreakdown": channels,
            }


transaction_service = TransactionService()
