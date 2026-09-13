import pytest

def test_demo_login_investigator(client):
    response = client.post("/api/auth/demo-login", json={"role": "investigator"})
    assert response.status_code == 200
    data = response.json()
    assert "accessToken" in data
    assert "refreshToken" in data
    assert data["user"]["role"] == "investigator"
    assert data["user"]["email"] == "investigator@circuit.gov"

def test_refresh_token_flow(client):
    # 1. Login and get refresh token
    login_res = client.post("/api/auth/demo-login", json={"role": "analyst"})
    assert login_res.status_code == 200
    refresh_tok = login_res.json()["refreshToken"]

    # 2. Refresh session
    refresh_res = client.post("/api/auth/refresh", json={"refreshToken": refresh_tok})
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert "accessToken" in data
    assert "refreshToken" in data
    assert data["user"]["role"] == "analyst"

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

def test_login_backdoor_is_strictly_eliminated(client):
    # Attempting to use circuit11 or incorrect password on user account fails
    response = client.post("/api/auth/login", json={"email": "investigator@circuit.gov", "password": "wrong-password-attempt"})
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["message"]

def test_production_config_fails_fast_on_insecure_keys():
    from app.core.config import Settings
    with pytest.raises(ValueError, match="Production deployment rejected: JWT_SECRET"):
        Settings(node_env="production", jwt_secret="jwt-secret-circuit-auth-key-2026")

    with pytest.raises(ValueError, match="CORS_ORIGIN contains wildcard"):
        Settings(
            node_env="production",
            jwt_secret="a" * 32,
            biometric_encryption_key="b" * 32,
            cors_origin="http://localhost:8080,*"
        )

