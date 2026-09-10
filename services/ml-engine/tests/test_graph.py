"""Unit and API tests for Graph Analytics."""
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.core.graph_manager import GraphManager
from app.schemas.common import EntityNode, GraphEdge
from app.schemas.graph import GraphState

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Service-Key": settings.INTERNAL_SERVICE_SECRET}


def build_sample_graph() -> GraphState:
    nodes = [
        EntityNode(id="P-1", label="Leader Vikram", entity_type="person", risk_flag=True),
        EntityNode(id="P-2", label="Broker Dinesh", entity_type="person"),
        EntityNode(id="P-3", label="Associate Amit", entity_type="person"),
        EntityNode(id="O-1", label="NorthStar Shell Co", entity_type="organization"),
    ]
    edges = [
        GraphEdge(source="P-1", target="P-2", rel_type="calls", count=10),
        GraphEdge(source="P-2", target="P-3", rel_type="associate_of", count=5),
        GraphEdge(source="P-2", target="O-1", rel_type="transferred_money", count=2, total_amount=500000.0),
    ]
    return GraphState(nodes=nodes, edges=edges)


def test_graph_manager_analytics():
    state = build_sample_graph()
    manager = GraphManager(state)

    metrics = manager.compute_metrics()
    assert metrics.node_count == 4
    assert metrics.edge_count == 3

    influence = manager.compute_influence()
    assert len(influence) >= 3
    # Dinesh is the central broker connected to all 3 others
    assert influence["P-2"].betweenness_norm >= influence["P-3"].betweenness_norm

    # Shortest path
    path_res = manager.find_shortest_path("P-1", "O-1")
    assert path_res.found is True
    assert path_res.path == ["P-1", "P-2", "O-1"]
    assert path_res.total_hops == 2

    # Node simulation
    sim_res = manager.simulate_node_removal("P-2")
    assert sim_res.new_components > sim_res.original_components


def test_graph_analytics_api():
    state = build_sample_graph()
    payload = {"graph": state.model_dump()}
    resp = client.post("/ml/graph/analytics", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["metrics"]["node_count"] == 4
    assert "influence_scores" in data


def test_shortest_path_api():
    state = build_sample_graph()
    payload = {
        "graph": state.model_dump(),
        "source_id": "P-1",
        "target_id": "O-1"
    }
    resp = client.post("/ml/graph/path", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["found"] is True
    assert len(data["hops"]) == 2
