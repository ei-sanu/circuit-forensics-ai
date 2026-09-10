import pytest

def test_demo_login_investigator(client):
    response = client.post("/api/auth/demo-login", json={"role": "investigator"})
    assert response.status_code == 200
    data = response.json()
    assert "accessToken" in data
    assert data["user"]["role"] == "investigator"
    assert data["user"]["email"] == "investigator@circuit.gov"

def test_demo_login_admin(client):
    response = client.post("/api/auth/demo-login", json={"role": "admin"})
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == "admin@circuit.gov"

def test_demo_login_analyst(client):
    response = client.post("/api/auth/demo-login", json={"role": "analyst"})
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "analyst"

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={"email": "nonexistent@circuit.gov", "password": "wrong"})
    assert response.status_code == 401

def test_get_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_get_me_authorized(client, investigator_token):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "investigator@circuit.gov"

def test_get_users_forbidden_for_investigator(client, investigator_token):
    response = client.get(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 403

def test_get_users_allowed_for_admin(client, admin_token):
    response = client.get(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
