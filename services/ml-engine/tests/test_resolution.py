"""Unit and API tests for entity resolution."""
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.core.resolver import EntityResolver
from app.schemas.resolve import EntityCandidate, TargetEntity

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Service-Key": settings.INTERNAL_SERVICE_SECRET}


def test_entity_resolver_fuzzy_and_alias():
    resolver = EntityResolver()
    candidates = [
        EntityCandidate(id="P-001", type="person", name="Vikram Rathore", aliases=["Vicky", "Don"]),
        EntityCandidate(id="P-002", type="person", name="Rajesh Sharma", aliases=[]),
        EntityCandidate(id="PH-01", type="phone", name="+919876543210", aliases=[]),
    ]

    # Exact name match
    res1 = resolver.resolve(TargetEntity(type="person", label="Vikram Rathore"), candidates)
    assert res1.matched_id == "P-001"
    assert res1.confidence >= 0.90

    # Typo match
    res2 = resolver.resolve(TargetEntity(type="person", label="Vikram Ratore"), candidates)
    assert res2.matched_id == "P-001"
    assert res2.confidence >= 0.80

    # Alias match
    res3 = resolver.resolve(TargetEntity(type="person", label="Vicky"), candidates)
    assert res3.matched_id == "P-001"
    assert res3.decision == "alias"

    # New entity
    res4 = resolver.resolve(TargetEntity(type="person", label="Amitabh Bachchan"), candidates)
    assert res4.matched_id is None
    assert res4.decision == "new_candidate"


def test_resolution_api():
    payload = {
        "target": {"type": "person", "label": "Vikram Rathore"},
        "candidates": [
            {"id": "P-001", "type": "person", "name": "Vikram Rathore", "aliases": []}
        ],
        "threshold": 0.75
    }
    resp = client.post("/ml/resolve", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["result"]["matched_id"] == "P-001"
