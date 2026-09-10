import pytest
import secrets

def test_list_entities(client, investigator_token):
    response = client.get(
        "/api/entities",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_entity(client, investigator_token):
    ent_id = f"P-TEST-{secrets.token_hex(3).upper()}"
    payload = {
        "entityId": ent_id,
        "type": "person",
        "label": "Test Suspect Operator",
        "riskFlag": True,
        "influenceScore": 88.0,
        "cases": ["CR-2026-00124"],
        "aliases": ["Shadow"],
    }
    response = client.post(
        "/api/entities",
        json=payload,
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["entityId"] == ent_id
    assert data["label"] == payload["label"]
