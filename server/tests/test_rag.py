import pytest
from app.ml.rag_engine import RAGEngine, chunk_text
from app.services.rag_service import rag_service


def test_chunk_text():
    sample_text = "A" * 1000
    chunks = chunk_text(sample_text, chunk_size=300, overlap=50)
    assert len(chunks) >= 4
    for chunk in chunks:
        assert len(chunk) <= 300


@pytest.mark.asyncio
async def test_rag_engine_lifecycle(tmp_path):
    # Test an isolated instance of RAGEngine
    engine = RAGEngine()
    
    docs = [
        {
            "document_id": "DOC-TEST-001",
            "title": "Hawala Bank Ledger - Surat",
            "case_id": "CR-2026-00124",
            "raw_text": (
                "Rajesh Verma transferred 48,500 INR across 12 structured deposits into "
                "Al-Falah Overseas factoring account in Dubai. Total routed volume exceeds 5.8 Crore INR."
            ),
        },
        {
            "document_id": "DOC-TEST-002",
            "title": "Vehicle Impoundment Log",
            "case_id": "CR-2026-00842",
            "raw_text": (
                "Intercepted Toyota Fortuner MH-04-AB-9921 transporting undocumented silver bullion "
                "near Vashi Toll Plaza. Driver identified as Sunil Kadam, linked to P-0004."
            ),
        },
    ]

    # Index
    res = await engine.index_documents(docs)
    assert res["indexed"] == 2
    assert res["total_chunks"] >= 2

    # Query 1: Hawala smurfing
    ctx1, citations1 = await engine.retrieve_context("Where was Rajesh Verma sending money?", top_k=2)
    assert "Rajesh Verma" in ctx1 or len(citations1) > 0
    assert any("Hawala Bank Ledger" in c["source"] for c in citations1)

    # Query 2: Case-scoped retrieval
    ctx2, citations2 = await engine.retrieve_context("silver bullion vehicle", case_id="CR-2026-00842", top_k=2)
    assert len(citations2) >= 1
    assert citations2[0]["document_id"] == "DOC-TEST-002"

    # Status check
    status = engine.get_status()
    assert status["total_chunks"] >= 2
    assert status["total_indexed_documents"] == 2


def test_copilot_rag_status_endpoint(client, investigator_token):
    response = client.get(
        "/api/copilot/rag/status",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "embed_model" in data
    assert "faiss_available" in data
    assert "sentence_transformers_available" in data
    assert "total_vectors" in data


def test_copilot_rag_index_endpoint(client, investigator_token):
    response = client.post(
        "/api/copilot/rag/index",
        json={"case_id": "CR-2026-00124"},
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "total_chunks" in data or "source" in data


def test_copilot_rag_rebuild_endpoint(client, investigator_token):
    response = client.post(
        "/api/copilot/rag/rebuild",
        json={"case_id": None},
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
