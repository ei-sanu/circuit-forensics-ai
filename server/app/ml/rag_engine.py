"""CIRCUIT 2.0 — Service-Level RAG Engine.

Provides a full Retrieval-Augmented Generation pipeline over all case documents
stored in the CIRCUIT database. Uses sentence-transformers for embeddings and
FAISS for fast vector similarity search — no external API required.

Pipeline:
  1. Load raw_text from Document table (per-case or global)
  2. Chunk text into overlapping windows
  3. Embed chunks with a local sentence-transformer model
  4. Store in a FAISS flat-L2 index (in-memory, persisted to disk as .index)
  5. At query time: embed query → retrieve top-k chunks → build evidence context
  6. Inject context into finetuned_llm_client prompt
"""

import os
import json
import logging
import hashlib
import pickle
from typing import List, Optional, Dict, Any, Tuple

logger = logging.getLogger("CIRCUIT.RAGEngine")

# ---------------------------------------------------------------------------
# Optional heavy-weight deps — degrade gracefully if not installed
# ---------------------------------------------------------------------------
try:
    import numpy as np
    _numpy_ok = True
except ImportError:
    _numpy_ok = False
    logger.warning("numpy not installed — RAG engine will use keyword fallback.")

try:
    import faiss  # type: ignore
    _faiss_ok = True
except ImportError:
    _faiss_ok = False
    logger.warning("faiss-cpu not installed — RAG will use cosine-sim fallback.")

try:
    from sentence_transformers import SentenceTransformer  # type: ignore
    _st_ok = True
except ImportError:
    _st_ok = False
    logger.warning("sentence-transformers not installed — RAG will use keyword fallback.")


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DEFAULT_EMBED_MODEL = "all-MiniLM-L6-v2"      # 384-dim, ~22 MB, very fast
CHUNK_SIZE = 400           # characters per chunk
CHUNK_OVERLAP = 80         # overlap between consecutive chunks
TOP_K = 5                  # chunks retrieved per query
INDEX_CACHE_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "rag_cache"
)


# ---------------------------------------------------------------------------
# Text Chunker
# ---------------------------------------------------------------------------
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping character-window chunks."""
    if not text or not text.strip():
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == len(text):
            break
        start += chunk_size - overlap
    return chunks


# ---------------------------------------------------------------------------
# RAG Engine
# ---------------------------------------------------------------------------
class RAGEngine:
    """
    Full in-process Retrieval-Augmented Generation engine for CIRCUIT documents.

    Usage:
        engine = RAGEngine()
        await engine.index_documents(docs)          # list of dicts with 'raw_text', 'document_id', 'title', 'case_id'
        context = await engine.retrieve_context(query, case_id=case_id)
        # inject context into LLM prompt
    """

    def __init__(self, embed_model_name: str = DEFAULT_EMBED_MODEL):
        self._model_name = embed_model_name
        self._model: Optional[Any] = None          # SentenceTransformer
        self._index: Optional[Any] = None          # faiss.IndexFlatL2
        self._chunks: List[str] = []               # parallel to index rows
        self._meta: List[Dict[str, str]] = []      # {document_id, title, case_id}
        self._indexed_doc_ids: set = set()
        self._dim: int = 384
        os.makedirs(INDEX_CACHE_DIR, exist_ok=True)

    # ------------------------------------------------------------------
    # Model loading (lazy)
    # ------------------------------------------------------------------
    def _load_model(self) -> bool:
        if self._model is not None:
            return True
        if not _st_ok or not _numpy_ok:
            return False
        try:
            logger.info(f"Loading embedding model: {self._model_name} ...")
            self._model = SentenceTransformer(self._model_name)
            test_emb = self._model.encode(["test"])
            self._dim = test_emb.shape[1]
            logger.info(f"Embedding model loaded. dim={self._dim}")
            return True
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            self._model = None
            return False

    def _ensure_index(self):
        if self._index is None and _faiss_ok and _numpy_ok:
            self._index = faiss.IndexFlatL2(self._dim)

    # ------------------------------------------------------------------
    # Embed helper
    # ------------------------------------------------------------------
    def _embed(self, texts: List[str]):
        """Return numpy float32 array (N, dim)."""
        if not texts:
            return None
        vecs = self._model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        return vecs.astype("float32")

    # ------------------------------------------------------------------
    # Indexing
    # ------------------------------------------------------------------
    async def index_documents(self, docs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Embed and index a list of documents.

        Args:
            docs: each item must have keys: document_id, raw_text
                  optional: title, case_id

        Returns:
            {indexed: int, skipped: int, total_chunks: int}
        """
        if not self._load_model():
            logger.warning("Embedding model unavailable — skipping vector indexing.")
            return {"indexed": 0, "skipped": len(docs), "total_chunks": 0, "engine": "keyword_fallback"}

        self._ensure_index()
        indexed = 0
        skipped = 0
        all_chunks: List[str] = []
        all_meta: List[Dict] = []

        for doc in docs:
            doc_id = doc.get("document_id") or doc.get("documentId") or ""
            raw_text = doc.get("raw_text") or doc.get("rawText") or ""
            title = doc.get("title", "Unknown Document")
            case_id = doc.get("case_id") or doc.get("caseId") or "global"

            if not raw_text.strip():
                skipped += 1
                continue

            if doc_id in self._indexed_doc_ids:
                skipped += 1
                continue

            chunks = chunk_text(raw_text)
            if not chunks:
                skipped += 1
                continue

            for chunk in chunks:
                all_chunks.append(chunk)
                all_meta.append({
                    "document_id": doc_id,
                    "title": title,
                    "case_id": case_id,
                })

            self._indexed_doc_ids.add(doc_id)
            indexed += 1

        if all_chunks:
            logger.info(f"Embedding {len(all_chunks)} chunks from {indexed} documents …")
            vecs = self._embed(all_chunks)
            if vecs is not None:
                self._index.add(vecs)
                self._chunks.extend(all_chunks)
                self._meta.extend(all_meta)
                logger.info(f"RAG index now has {self._index.ntotal} vectors.")

        return {
            "indexed": indexed,
            "skipped": skipped,
            "total_chunks": len(all_chunks),
            "total_indexed_vectors": self._index.ntotal if self._index else 0,
            "engine": "faiss_l2",
        }

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------
    async def retrieve_context(
        self,
        query: str,
        case_id: Optional[str] = None,
        top_k: int = TOP_K,
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Retrieve the most relevant document chunks for a query.

        Returns:
            (context_string, citations_list)
        """
        if not query.strip():
            return "", []

        # --- Vector retrieval path ---
        if (
            self._model is not None
            and self._index is not None
            and _faiss_ok
            and self._index.ntotal > 0
        ):
            return await self._vector_retrieve(query, case_id=case_id, top_k=top_k)

        # --- Keyword fallback ---
        return self._keyword_retrieve(query, case_id=case_id, top_k=top_k)

    async def _vector_retrieve(
        self, query: str, case_id: Optional[str], top_k: int
    ) -> Tuple[str, List[Dict[str, Any]]]:
        q_vec = self._embed([query])
        if q_vec is None:
            return "", []

        search_k = min(top_k * 4, self._index.ntotal)  # over-fetch for case filter
        distances, indices = self._index.search(q_vec, search_k)

        results = []
        seen_chunks = set()
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(self._chunks):
                continue
            meta = self._meta[idx]
            # Optional: filter by case_id
            if case_id and meta.get("case_id") not in (case_id, "global", None):
                continue
            chunk = self._chunks[idx]
            if chunk in seen_chunks:
                continue
            seen_chunks.add(chunk)
            results.append({
                "chunk": chunk,
                "document_id": meta["document_id"],
                "title": meta["title"],
                "case_id": meta["case_id"],
                "score": float(1.0 / (1.0 + dist)),  # convert L2 dist to pseudo-similarity
            })
            if len(results) >= top_k:
                break

        context = self._format_context(results)
        citations = [
            {"source": r["title"], "document_id": r["document_id"], "relevance": round(r["score"], 3)}
            for r in results
        ]
        return context, citations

    def _keyword_retrieve(
        self, query: str, case_id: Optional[str], top_k: int
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """Fallback TF-IDF-style keyword overlap retrieval."""
        query_words = set(query.lower().split())
        scored = []
        for i, chunk in enumerate(self._chunks):
            meta = self._meta[i]
            if case_id and meta.get("case_id") not in (case_id, "global", None):
                continue
            chunk_words = set(chunk.lower().split())
            overlap = len(query_words & chunk_words)
            if overlap > 0:
                scored.append((overlap, i))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for _, idx in scored[:top_k]:
            meta = self._meta[idx]
            results.append({
                "chunk": self._chunks[idx],
                "document_id": meta["document_id"],
                "title": meta["title"],
                "case_id": meta["case_id"],
                "score": 0.5,
            })

        context = self._format_context(results)
        citations = [
            {"source": r["title"], "document_id": r["document_id"], "relevance": r["score"]}
            for r in results
        ]
        return context, citations

    def _format_context(self, results: List[Dict]) -> str:
        if not results:
            return ""
        parts = ["=== RETRIEVED EVIDENCE CONTEXT ==="]
        for i, r in enumerate(results, 1):
            parts.append(
                f"[{i}] Source: {r['title']} (Doc: {r['document_id']}, Case: {r['case_id']})\n"
                f"    {r['chunk']}"
            )
        parts.append("=== END EVIDENCE CONTEXT ===")
        return "\n\n".join(parts)

    # ------------------------------------------------------------------
    # Index persistence
    # ------------------------------------------------------------------
    def save_index(self, tag: str = "global") -> bool:
        """Persist FAISS index + chunk metadata to disk."""
        if not _faiss_ok or self._index is None or self._index.ntotal == 0:
            return False
        try:
            index_path = os.path.join(INDEX_CACHE_DIR, f"{tag}.faiss")
            meta_path = os.path.join(INDEX_CACHE_DIR, f"{tag}.pkl")
            faiss.write_index(self._index, index_path)
            with open(meta_path, "wb") as f:
                pickle.dump({"chunks": self._chunks, "meta": self._meta, "doc_ids": self._indexed_doc_ids}, f)
            logger.info(f"RAG index saved → {index_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to save RAG index: {e}")
            return False

    def load_index(self, tag: str = "global") -> bool:
        """Reload persisted FAISS index from disk."""
        index_path = os.path.join(INDEX_CACHE_DIR, f"{tag}.faiss")
        meta_path = os.path.join(INDEX_CACHE_DIR, f"{tag}.pkl")
        if not os.path.exists(index_path) or not os.path.exists(meta_path):
            return False
        try:
            if not _faiss_ok:
                return False
            self._index = faiss.read_index(index_path)
            with open(meta_path, "rb") as f:
                data = pickle.load(f)
            self._chunks = data["chunks"]
            self._meta = data["meta"]
            self._indexed_doc_ids = data.get("doc_ids", set())
            logger.info(f"RAG index loaded: {self._index.ntotal} vectors from {index_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load RAG index: {e}")
            return False

    # ------------------------------------------------------------------
    # Status
    # ------------------------------------------------------------------
    def get_status(self) -> Dict[str, Any]:
        return {
            "embed_model": self._model_name,
            "model_loaded": self._model is not None,
            "faiss_available": _faiss_ok,
            "sentence_transformers_available": _st_ok,
            "total_vectors": self._index.ntotal if self._index else 0,
            "total_chunks": len(self._chunks),
            "total_indexed_documents": len(self._indexed_doc_ids),
            "index_dim": self._dim,
            "cache_dir": INDEX_CACHE_DIR,
        }


# Singleton
rag_engine = RAGEngine()
