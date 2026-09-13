"""Unit and integration tests for Transaction intelligence APIs."""
import pytest
import secrets

def test_create_and_query_transaction(client, investigator_token):
    tx_id = f"TXN-TEST-{secrets.token_hex(4).upper()}"
    payload = {
        "transactionId": tx_id,
        "caseId": "CR-2026-00124",
        "fromId": "ACC-TEST-001",
        "toId": "ACC-TEST-002",
        "amount": 550000.0,
        "currency": "INR",
        "channel": "RTGS",
        "isFlagged": True,
    }

    # 1. Create Transaction
    create_resp = client.post(
        "/api/transactions",
        json=payload,
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["transactionId"] == tx_id
    assert created["amount"] == 550000.0
    assert created["isFlagged"] is True

    # 2. Get Single Transaction
    get_resp = client.get(
        f"/api/transactions/{tx_id}",
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["transactionId"] == tx_id

    # 3. List Transactions with Filter
    list_resp = client.get(
        "/api/transactions?minAmount=500000",
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert list_resp.status_code == 200
    txns = list_resp.json()
    assert isinstance(txns, list)
    assert any(t["transactionId"] == tx_id for t in txns)

def test_transaction_batch_import_and_stats(client, investigator_token):
    csv_content = (
        "transaction_id,from_id,to_id,amount,channel,timestamp,is_flagged\n"
        "TXN-CSV-01,MULE-A,MULE-B,48000,UPI,2026-08-01T10:00:00Z,false\n"
        "TXN-CSV-02,MULE-A,MULE-B,49500,UPI,2026-08-01T11:00:00Z,false\n"
        "TXN-CSV-03,MULE-A,MULE-B,47000,UPI,2026-08-01T12:00:00Z,false\n"
        "TXN-CSV-04,MULE-B,SHELL-CORP,1200000,RTGS,2026-08-01T13:00:00Z,true\n"
    )

    # 1. Batch Ingest
    files = {"file": ("bank_feed.csv", csv_content.encode("utf-8"), "text/csv")}
    data = {"caseId": "CR-2026-00124"}
    import_resp = client.post(
        "/api/transactions/import",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert import_resp.status_code == 200
    res = import_resp.json()
    assert res["success"] is True
    assert res["importedCount"] == 4
    assert res["totalVolume"] > 1300000.0

    # 2. Query Stats
    stats_resp = client.get(
        "/api/transactions/stats?caseId=CR-2026-00124",
        headers={"Authorization": f"Bearer {investigator_token}"},
    )
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["transactionCount"] >= 4
    assert stats["totalVolume"] > 0
    assert "topSenders" in stats
