"""Unit and integration tests for Chronological Timeline and Evidence Dossier APIs."""
import pytest
import secrets

def test_case_timeline_query(client, investigator_token):
    resp = client.get(
        "/api/timeline?caseId=CR-2026-00124",
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert resp.status_code == 200
    events = resp.json()
    assert isinstance(events, list)

def test_evidence_provenance_query(client, investigator_token):
    # First create or ensure an entity exists
    ent_id = f"ENT-PROV-{secrets.token_hex(3).upper()}"
    client.post(
        "/api/entities",
        json={
            "entityId": ent_id,
            "label": "Vikram Rathore",
            "type": "person",
            "riskFlag": True,
            "cases": ["CR-2026-00124"],
        },
        headers={"Authorization": f"Bearer {investigator_token}"},
    )

    resp = client.get(
        f"/api/evidence/provenance/{ent_id}",
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["entityId"] == ent_id
    assert "provenanceScore" in data
    assert "provenanceTrail" in data

def test_court_dossier_generation(client, investigator_token):
    payload = {
        "caseId": "CR-2026-00124",
        "officerName": "Inspector A. K. Sharma",
        "officerBadge": "MH-CID-8821",
    }
    resp = client.post(
        "/api/reports/generate",
        json=payload,
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert resp.status_code == 200
    dossier = resp.json()
    assert dossier["caseNumber"] == "CR-2026-00124"
    assert "statutoryCertification" in dossier
    assert "digitalSignatureHash" in dossier["signatoryOfficer"]
    assert "evidenceAppendix" in dossier
    assert "executiveSummary" in dossier
