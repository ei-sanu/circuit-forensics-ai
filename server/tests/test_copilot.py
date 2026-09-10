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
