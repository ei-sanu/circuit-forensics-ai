def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "CIRCUIT Core API"

def test_api_health_check_alias(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_liveness_probe(client):
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json()["status"] == "live"

def test_readiness_probe(client):
    response = client.get("/health/ready")
    assert response.status_code in (200, 503)
    assert "dependencies" in response.json()
