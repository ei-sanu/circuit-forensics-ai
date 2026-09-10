import pytest
from app.utils.biometric_crypto import BiometricCryptoUtil

def test_biometric_crypto_encryption_decryption():
    """Verify AES-256-GCM symmetric encryption/decryption roundtrip."""
    test_vector = [0.123456, -0.654321, 0.987654, -0.112233] + [0.0] * 124
    encrypted = BiometricCryptoUtil.encrypt_template(test_vector)
    
    assert isinstance(encrypted, str)
    assert len(encrypted.split(":")) == 3
    
    decrypted = BiometricCryptoUtil.decrypt_template(encrypted)
    assert len(decrypted) == 128
    assert round(decrypted[0], 4) == round(test_vector[0], 4)
    assert round(decrypted[1], 4) == round(test_vector[1], 4)

def test_get_biometric_telemetry(client, investigator_token):
    response = client.get(
        "/api/biometric/telemetry",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "totalEnrolledUsers" in data
    assert data["systemAlgorithm"] == "AES-256-GCM"

def test_get_biometric_status(client, investigator_token):
    response = client.get(
        "/api/biometric/status",
        headers={"Authorization": f"Bearer {investigator_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "isEnrolled" in data
    assert "status" in data

def test_verify_nonexistent_challenge(client):
    response = client.post(
        "/api/biometric/verify",
        json={"challengeId": "chn_nonexistent_123", "faceImage": "data:image/jpeg;base64,sample"}
    )
    assert response.status_code == 401
