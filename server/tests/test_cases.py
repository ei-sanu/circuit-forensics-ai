import pytest
import secrets

def test_list_cases(client, investigator_token):
    response = client.get(
        "/api/cases",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_case_detail(client, investigator_token):
    response = client.get(
        "/api/cases/CR-2026-00124",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    if response.status_code == 200:
        assert response.json()["caseNumber"] == "CR-2026-00124"
    else:
        assert response.status_code == 404

def test_create_case(client, investigator_token):
    case_num = f"CR-TEST-{secrets.token_hex(4).upper()}"
    payload = {
        "caseNumber": case_num,
        "title": "Automated Test Syndicate Case",
        "description": "Integration test created case",
        "priority": "high",
        "status": "active",
        "tags": ["test"],
    }
    response = client.post(
        "/api/cases",
        json=payload,
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["caseNumber"] == case_num
    assert data["title"] == payload["title"]
