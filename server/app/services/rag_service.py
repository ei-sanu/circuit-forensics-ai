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
        """Fetch documents with raw_text from the database."""
        try:
            maker = get_session_maker()
            async with maker() as session:
                query = select(Document).where(Document.raw_text.isnot(None))
                if case_id:
                    query = query.where(Document.case_id == case_id)
                result = await session.execute(query)
                docs = result.scalars().all()
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
            return []

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
        status = rag_engine.get_status()
        status["initialized"] = self._initialized
        status["indexed_documents_session"] = self._indexed_doc_count
        return status


# Singleton
rag_service = RAGService()
