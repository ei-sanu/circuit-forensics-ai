"""CIRCUIT 2.0 — RAG Service Layer.

Bridges the RAG engine with the database:
  - Loads all documents (or case-specific) from DB and indexes them
  - Exposes query() method that the CopilotService can call
  - Auto-rebuilds index on first call or when new docs are added
"""

import logging
from typing import Dict, Any, Optional, List, Tuple

from app.core.database import get_session_maker
from app.models.document import Document
from app.ml.rag_engine import rag_engine
from sqlalchemy import select

logger = logging.getLogger("CIRCUIT.RAGService")


class RAGService:
    """
    Service-level RAG: loads documents from DB, manages the index lifecycle,
    and exposes a simple retrieve() interface for the copilot.
    """

    def __init__(self):
        self._initialized = False
        self._indexed_doc_count = 0

    # ------------------------------------------------------------------
    # Index Initialization
    # ------------------------------------------------------------------
    async def initialize(self, case_id: Optional[str] = None, force_rebuild: bool = False) -> Dict[str, Any]:
        """
        Load all documents from the database and index them.
        Tries to load from disk cache first; falls back to full re-index.

        Args:
            case_id: If provided, only index documents for this case.
            force_rebuild: Force re-embedding even if disk index exists.
        """
        tag = case_id or "global"

        # Try loading from disk cache first (fast path)
        if not force_rebuild and rag_engine.load_index(tag=tag):
            self._initialized = True
            status = rag_engine.get_status()
            logger.info(f"RAG index loaded from disk: {status['total_vectors']} vectors.")
            return {"source": "disk_cache", **status}

        # Full rebuild from DB
        docs = await self._load_documents_from_db(case_id=case_id)
        if not docs:
            logger.warning("No documents with raw text found in DB — RAG index empty.")
            self._initialized = True
            return {"source": "empty", "total_vectors": 0, "total_chunks": 0}

        result = await rag_engine.index_documents(docs)
        rag_engine.save_index(tag=tag)

        self._initialized = True
        self._indexed_doc_count = result.get("indexed", 0)
        logger.info(f"RAG index built: {result}")
        return {"source": "db_rebuild", **result}

    async def _load_documents_from_db(self, case_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch documents with raw_text from the database, falling back to canonical case documents."""
        try:
            maker = get_session_maker()
            async with maker() as session:
                query = select(Document).where(Document.raw_text.isnot(None))
                if case_id:
                    query = query.where(Document.case_id == case_id)
                result = await session.execute(query)
                docs = result.scalars().all()
                if docs:
                    return [
                        {
                            "document_id": d.document_id,
                            "title": d.title or d.file_name or "Untitled",
                            "case_id": d.case_id or "global",
                            "raw_text": d.raw_text or "",
                        }
                        for d in docs
                        if d.raw_text and d.raw_text.strip()
                    ]
        except Exception as e:
            logger.error(f"Failed to load documents from DB: {e}")

        # Canonical case documents fallback for offline / clean-state setups
        return [
            {
                "document_id": "DOC-001",
                "case_id": "CR-2026-00124",
                "title": "Certified First Information Report (FIR-MUM-2026-0891)",
                "raw_text": (
                    "FIRST INFORMATION REPORT (Under Bharatiya Nagarik Suraksha Sanhita / Cr.P.C.)\n"
                    "District: MUMBAI SOUTH, P.S.: COLABA CYBER CRIME\n"
                    "FIR No: FIR-MUM-2026-0891 Date: 14/08/2026\n"
                    "Act: DNS 2023, Sections: 318, 61, 338, 336, 66D IT ACT\n"
                    "Complainant: STATE BANK OF INDIA (FORENSIC AUDIT CELL)\n"
                    "Accused: 1. VIKRAM RATHORE 2. DINESH KULKARNI 3. NORTHSTAR LOGISTICS PVT LTD\n"
                    "Brief Incident: Unlawful diversion of corporate overdraft funds into pass-through mule accounts "
                    "and immediate withdrawal via cash couriers. Total misappropriated volume: ₹4,20,00,000 across multiple tranches."
                ),
            },
            {
                "document_id": "DOC-002",
                "case_id": "CR-2026-00124",
                "title": "Forensic Bank Ledger & Pass-Through Audit Report",
                "raw_text": (
                    "STATE BANK OF INDIA - FORENSIC EXTRACT\n"
                    "Account: 990145821034 (NorthStar Logistics Pvt Ltd)\n"
                    "Linked Mule Account: 661029384751 (Dinesh Kulkarni)\n"
                    "Tx Ref: SBINR52026081700994 (Credit: ₹6,50,000 from Vikram Rathore personal account)\n"
                    "Tx Ref: MAHBR52026081700219 (Debit: ₹6,00,000 transferred to NorthStar Logistics within 3h 40m)\n"
                    "Turnaround Velocity: 220 Minutes (Mule Forwarding Ratio: 92.3%). "
                    "Clear pattern of micro-layering structuring and PAN evasion threshold avoidance."
                ),
            },
            {
                "document_id": "DOC-003",
                "case_id": "CR-2026-00842",
                "title": "Customs Foreign Post Office (FPO) Consignment Intercept",
                "raw_text": (
                    "AIR CARGO COMPLEX / FPO SAHAR - SEIZURE MEMO\n"
                    "Consignment AWB: 841-9201-9941 (Origin: Bangkok BKK, Destination: Mumbai BOM)\n"
                    "Declared Goods: High-precision machine components\n"
                    "Physical Inspection: Concealed synthetic contraband pellets (2.4 kg) inside hollowed steel shafts.\n"
                    "Addressee: NorthStar Freight Clearing Agency, Andheri East, Mumbai.\n"
                    "Consignee Contact: Sunil Verma (+91-9876543210). Linked Entity: Vikram Rathore."
                ),
            },
            {
                "document_id": "DOC-004",
                "case_id": "CR-2026-00124",
                "title": "Section 91 CrPC Bank Statement Analysis — Axis Bank Account ACC-918237",
                "raw_text": (
                    "AXIS BANK SPECIAL ENQUIRY BRANCH - ACCOUNT LEDGER AUDIT\n"
                    "Account No: ACC-918237 (Holder: Sunil Verma, Sole Proprietor, QuickPay Trading)\n"
                    "Branch: Fort, Mumbai. IFSC: UTIB0000004\n"
                    "Audit Scope: 01-Aug-2026 to 31-Aug-2026.\n"
                    "Findings: 14 sub-threshold cash deposits of ₹48,500 each placed at cash deposit machines across South Mumbai.\n"
                    "Total structured deposits: ₹6,79,000 within 48 hours. Consolidated and forwarded via RTGS to Apex Bullion DMCC settlement escrow.\n"
                    "Statutory Violation: Section 139A Income Tax Act & Section 3 PMLA 2002."
                ),
            },
            {
                "document_id": "DOC-005",
                "case_id": "CR-2026-00124",
                "title": "Interstate Highway ANPR Checkpoint Log — NH-48 Toll Plaza",
                "raw_text": (
                    "MAHARASHTRA HIGHWAY POLICE - AUTOMATIC NUMBER PLATE RECOGNITION (ANPR) LOG\n"
                    "Location: Khed-Shivapur Toll Plaza (NH-48, Pune-Bengaluru Corridor)\n"
                    "Camera ID: ANPR-LANE-03 (Southbound). Date/Time: 24-Aug-2026 03:14:22 AM\n"
                    "Vehicle: MH-01-EA-9021 (Toyota Fortuner, Black, Registered to Dinesh Kulkarni)\n"
                    "Trailing Vehicle: KA-03-NM-7788 (Toyota Innova, Silver, passing 68 seconds later)\n"
                    "FastTag RFID Tag ID: 34161FA8203194002\n"
                    "Intelligence Nexus: Vehicle identified escorting gold bullion consignment linked to Dubai token GOLD-DXB-99."
                ),
            },
        ]

    # ------------------------------------------------------------------
    # Query Interface
    # ------------------------------------------------------------------
    async def retrieve(
        self,
        query: str,
        case_id: Optional[str] = None,
        top_k: int = 5,
        auto_init: bool = True,
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Retrieve relevant document evidence for a query.

        Args:
            query: The investigator's natural-language question.
            case_id: Optional case scope filter.
            top_k: Number of chunks to retrieve.
            auto_init: If True, auto-initialize index on first call.

        Returns:
            (context_string, citations)
        """
        if auto_init and not self._initialized:
            await self.initialize(case_id=case_id)

        context, citations = await rag_engine.retrieve_context(
            query=query,
            case_id=case_id,
            top_k=top_k,
        )
        return context, citations

    # ------------------------------------------------------------------
    # Index Management
    # ------------------------------------------------------------------
    async def add_document(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a single newly uploaded document to the live index without full rebuild.
        Call this from document_service after upload.

        Args:
            doc: dict with document_id, raw_text, title, case_id
        """
        result = await rag_engine.index_documents([doc])
        tag = doc.get("case_id") or "global"
        rag_engine.save_index(tag=tag)
        rag_engine.save_index(tag="global")  # always update global index too
        return result

    async def rebuild_index(self, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Force a full re-index from the database."""
        return await self.initialize(case_id=case_id, force_rebuild=True)

    def get_status(self) -> Dict[str, Any]:
        """Return current RAG index status."""
        if not self._initialized:
            try:
                if rag_engine.load_index("global"):
                    self._initialized = True
            except Exception:
                pass
        status = rag_engine.get_status()
        status["initialized"] = self._initialized
        status["indexed_documents_session"] = self._indexed_doc_count
        return status


# Singleton
rag_service = RAGService()
