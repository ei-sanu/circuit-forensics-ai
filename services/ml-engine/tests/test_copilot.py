"""Unit and API tests for Copilot AI Reasoning."""
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.schemas.common import EntityNode, GraphEdge
from app.schemas.graph import GraphState

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Service-Key": settings.INTERNAL_SERVICE_SECRET}


def test_copilot_influence_and_qa():
    graph_state = GraphState(
        nodes=[
            EntityNode(id="P-1", label="Vikram Rathore", entity_type="person", risk_flag=True),
            EntityNode(id="P-2", label="Dinesh Kulkarni", entity_type="person"),
        ],
        edges=[
            GraphEdge(source="P-1", target="P-2", rel_type="calls", count=10)
        ]
    )

    payload = {
        "query": "Who are the most influential entities?",
        "graph": graph_state.model_dump()
    }
    resp = client.post("/ml/copilot", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "influence_ranking"
    assert len(data["direct_facts"]) > 0
    assert "disclaimer" in data
