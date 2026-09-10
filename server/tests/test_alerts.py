import pytest

def test_list_alerts(client, investigator_token):
    response = client.get(
        "/api/alerts",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_refresh_alerts(client, investigator_token):
    response = client.post(
        "/api/alerts/refresh?caseId=CR-2026-00124",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "alerts" in data
