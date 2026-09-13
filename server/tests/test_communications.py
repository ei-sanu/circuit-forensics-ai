"""Unit and integration tests for Telecommunications and CDR intelligence APIs."""
import pytest
import secrets

def test_create_and_query_communication(client, investigator_token):
    comm_id = f"CDR-TEST-{secrets.token_hex(4).upper()}"
    payload = {
        "communicationId": comm_id,
        "caseId": "CR-2026-00124",
        "fromNumber": "+919876543210",
        "toNumber": "+919811122233",
        "type": "voice_call",
        "duration": 240,
        "cellTowerId": "TOWER-MUM-BANDRA-01",
    }

    # 1. Create Record
    resp = client.post(
        "/api/communications",
        json=payload,
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert resp.status_code == 201
    created = resp.json()
    assert created["communicationId"] == comm_id
    assert created["duration"] == 240
    assert "+919876543210" in created["fromNumber"]

    # 2. Get Single Record
    get_resp = client.get(
        f"/api/communications/{comm_id}",
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["communicationId"] == comm_id

    # 3. List with Filter
    list_resp = client.get(
        "/api/communications?phoneNumber=9876543210",
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert list_resp.status_code == 200
    records = list_resp.json()
    assert isinstance(records, list)
    assert any(r["communicationId"] == comm_id for r in records)

def test_communication_batch_import_and_stats(client, investigator_token):
    csv_content = (
        "communication_id,from_number,to_number,type,duration,timestamp,cell_tower_id\n"
        "CDR-CSV-01,9876543210,9811122233,voice_call,120,2026-08-01T02:15:00Z,TOWER-DELHI-01\n"
        "CDR-CSV-02,9876543210,9811122233,voice_call,85,2026-08-01T03:30:00Z,TOWER-DELHI-01\n"
        "CDR-CSV-03,9811122233,9822233344,sms,0,2026-08-01T14:00:00Z,TOWER-DELHI-02\n"
    )

    # 1. Batch Ingest
    files = {"file": ("telecom_cdr.csv", csv_content.encode("utf-8"), "text/csv")}
    data = {"caseId": "CR-2026-00124"}
    import_resp = client.post(
        "/api/communications/import",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert import_resp.status_code == 200
    res = import_resp.json()
    assert res["success"] is True
    assert res["importedCount"] == 3
    assert res["nocturnalCount"] == 2

    # 2. Stats Query
    stats_resp = client.get(
        "/api/communications/stats?caseId=CR-2026-00124",
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["totalRecords"] >= 3
    assert stats["nocturnalCallCount"] >= 2
    assert "topCallers" in stats
