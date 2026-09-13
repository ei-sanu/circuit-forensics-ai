"""Unit and API tests for anomaly detectors."""
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.core.anomaly_engine import AnomalyEngine
from app.schemas.common import CommunicationRecord, EntityNode, GraphEdge, TransactionRecord

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Service-Key": settings.INTERNAL_SERVICE_SECRET}


def test_anomaly_detectors_core():
    nodes = [
        EntityNode(id="A-1", label="Mule Account 1", entity_type="account"),
        EntityNode(id="A-2", label="Mule Account 2", entity_type="account"),
        EntityNode(id="A-3", label="Mule Account 3", entity_type="account"),
        EntityNode(id="P-1", label="User 1", entity_type="person"),
    ]
    transactions = [
        # Large transaction
        TransactionRecord(
            id="tx-1",
            from_type="account",
            from_id="A-1",
            to_type="account",
            to_id="A-2",
            amount=600000.0,
            timestamp="2025-08-01T10:00:00Z",
            is_flagged=True
        ),
        # Circular loop (A-1 -> A-2 -> A-3 -> A-1)
        TransactionRecord(id="tx-2", from_type="account", from_id="A-2", to_type="account", to_id="A-3", amount=500000.0, timestamp="2025-08-01T11:00:00Z"),
        TransactionRecord(id="tx-3", from_type="account", from_id="A-3", to_type="account", to_id="A-1", amount=450000.0, timestamp="2025-08-01T12:00:00Z"),
        # Structuring sub-threshold PAN evasion transfers (A-1 -> P-1)
        TransactionRecord(id="tx-smurf-1", from_type="account", from_id="A-1", to_type="person", to_id="P-1", amount=48000.0, timestamp="2025-08-01T13:00:00Z"),
        TransactionRecord(id="tx-smurf-2", from_type="account", from_id="A-1", to_type="person", to_id="P-1", amount=49500.0, timestamp="2025-08-01T14:00:00Z"),
        TransactionRecord(id="tx-smurf-3", from_type="account", from_id="A-1", to_type="person", to_id="P-1", amount=47000.0, timestamp="2025-08-01T15:00:00Z"),
    ]
    comms = [
        CommunicationRecord(id=f"c-{i}", from_number="+919876543210", to_number="+919811122233", timestamp="2025-08-01T02:30:00Z")
        for i in range(6)
    ]

    engine = AnomalyEngine(nodes=nodes, edges=[], transactions=transactions, communications=comms)
    alerts = engine.run_all()

    det_names = {a.detector_name for a in alerts}
    assert "large_transaction" in det_names
    assert "circular_flow" in det_names
    assert "odd_hour_communications" in det_names
    assert "structuring_smurfing" in det_names


def test_detect_anomalies_api():
    payload = {
        "nodes": [{"id": "A-1", "label": "Acc 1", "entity_type": "account"}],
        "edges": [],
        "transactions": [
            {
                "id": "tx-99",
                "from_type": "account",
                "from_id": "A-1",
                "to_type": "account",
                "to_id": "A-2",
                "amount": 750000.0,
                "timestamp": "2025-08-01T10:00:00Z",
                "is_flagged": False
            }
        ],
        "communications": []
    }
    resp = client.post("/ml/detect-anomalies", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_alerts"] >= 1
    assert data["alerts"][0]["detector_name"] == "large_transaction"
