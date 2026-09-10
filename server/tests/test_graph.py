import pytest

def test_get_graph_state(client, investigator_token):
    response = client.get(
        "/api/graph",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert isinstance(data["nodes"], list)
    assert isinstance(data["edges"], list)

def test_get_graph_analytics(client, investigator_token):
    response = client.get(
        "/api/graph/analytics",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "graph" in data
    assert "analytics" in data

def test_simulate_node_removal(client, investigator_token):
    response = client.post(
        "/api/graph/simulate",
        json={"nodeId": "P-0001"},
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["removedNodeId"] == "P-0001"
    assert "remainingNodesCount" in data

def test_get_transactions(client, investigator_token):
    response = client.get(
        "/api/graph/transactions",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_communications(client, investigator_token):
    response = client.get(
        "/api/graph/communications",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
