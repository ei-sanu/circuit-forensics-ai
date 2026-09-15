import pytest

def test_ask_copilot(client, investigator_token):
    response = client.post(
        "/api/copilot/ask",
        json={"query": "Who is the primary syndicate leader in Operation Nightfall?", "caseId": "CR-2026-00124"},
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "confidence" in data

def test_query_copilot_alias(client, investigator_token):
    response = client.post(
        "/api/copilot/query",
        json={"query": "Identify cross-border gold bullion factoring routes.", "caseId": "CR-2026-00842"},
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    assert "answer" in response.json()

def test_copilot_model_status(client, investigator_token):
    response = client.get(
        "/api/copilot/model-status",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "active_engine" in data
    assert "training_samples_count" in data
    assert len(data.get("supported_tasks", [])) >= 3

def test_copilot_info_public(client):
    response = client.get("/api/copilot/info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "checkpoint_available" in data
