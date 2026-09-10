import pytest

def test_get_audit_logs(client, admin_token):
    response = client.get(
        "/api/audit",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_audit_logs_forbidden_for_hr(client, hr_token):
    response = client.get(
        "/api/audit",
        headers={"Authorization": f"Bearer {hr_token}"}
    )
    assert response.status_code == 403
