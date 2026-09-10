"""Unit and API tests for NER extraction."""
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.core.ner_extractor import NERExtractor

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Service-Key": settings.INTERNAL_SERVICE_SECRET}


def test_ner_extractor_core():
    extractor = NERExtractor()
    text = (
        "Inspector Rajesh Kumar reported that suspect Vikram Rathore (ph: +91 98765 43210) "
        "driving vehicle DL 01 AB 1234 transferred ₹ 5,00,000 to NorthStar Logistics in Mumbai on 14-08-2025."
    )
    entities, relations = extractor.extract(text)

    types = {e.type for e in entities}
    assert "person" in types
    assert "phone" in types
    assert "vehicle" in types
    assert "money" in types
    assert "organization" in types
    assert "location" in types
    assert "date" in types

    phone_ent = next(e for e in entities if e.type == "phone")
    assert phone_ent.label == "+919876543210"

    veh_ent = next(e for e in entities if e.type == "vehicle")
    assert veh_ent.label == "DL01AB1234"

    assert len(relations) > 0


def test_extraction_api_auth():
    # Without header -> 401
    resp = client.post("/ml/extract", json={"text": "Test text"})
    assert resp.status_code == 401

    # With invalid header -> 403
    resp = client.post("/ml/extract", json={"text": "Test text"}, headers={"X-Internal-Service-Key": "wrong"})
    assert resp.status_code == 403

    # With valid header -> 200
    resp = client.post(
        "/ml/extract",
        json={"text": "Suspect Sunil Verma calls +91 98111 22233."},
        headers=AUTH_HEADERS
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "entities" in data
    assert "execution_time_ms" in data
