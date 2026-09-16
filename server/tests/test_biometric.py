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

def test_is_synthetic_seed_template_detection():
    """Verify detection of synthetic mathematical placeholders."""
    import math
    from app.services.biometric_service import is_synthetic_seed_template

    seed_vec = [math.sin((idx + 1) * 2 * 0.1) + math.cos(idx * 0.2) for idx in range(128)]
    norm = math.sqrt(sum(v * v for v in seed_vec)) or 1.0
    seed_norm = [round(v / norm, 6) for v in seed_vec]

    assert is_synthetic_seed_template("SYSTEM_SEED", seed_norm) is True
    assert is_synthetic_seed_template("SYSTEM", seed_norm) is True
    assert is_synthetic_seed_template("investigator@circuit.gov", seed_norm) is True

    # Real user embedding (diverse, non-sine values)
    import numpy as np
    rng = np.random.RandomState(42)
    real_vec = rng.randn(128)
    real_vec = (real_vec / np.linalg.norm(real_vec)).tolist()
    assert is_synthetic_seed_template("INITIAL_LOGIN_ENROLLMENT", real_vec) is False

def test_close_distance_face_verification():
    """Verify that scale-invariant face cropping enables high similarity for close-distance faces."""
    import io, base64
    from PIL import Image, ImageDraw
    from app.ml.face_engine import FaceEngine

    fe = FaceEngine()

    # Normal distance face
    img_norm = Image.new("RGB", (320, 320), color=(30, 30, 40))
    draw_n = ImageDraw.Draw(img_norm)
    draw_n.ellipse([80, 60, 240, 260], fill=(215, 160, 125))
    draw_n.ellipse([110, 120, 140, 140], fill=(40, 30, 25))
    draw_n.ellipse([180, 120, 210, 140], fill=(40, 30, 25))
    draw_n.line([160, 140, 160, 180], fill=(180, 120, 90), width=4)
    draw_n.line([130, 210, 190, 210], fill=(170, 70, 70), width=6)

    # Close distance face (fills 90% of frame)
    img_close = Image.new("RGB", (320, 320), color=(30, 30, 40))
    draw_c = ImageDraw.Draw(img_close)
    draw_c.ellipse([15, 10, 305, 310], fill=(215, 160, 125))
    draw_c.ellipse([65, 110, 115, 145], fill=(40, 30, 25))
    draw_c.ellipse([205, 110, 255, 145], fill=(40, 30, 25))
    draw_c.line([160, 140, 160, 210], fill=(180, 120, 90), width=7)
    draw_c.line([100, 250, 220, 250], fill=(170, 70, 70), width=10)

    buf = io.BytesIO()
    img_close.save(buf, format="JPEG")
    b64_close = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

    enrolled_vec = fe.extract_embedding(img_norm)
    res = fe.verify_1to1(b64_close, enrolled_vec, liveness_data={"blink_detected": True, "motion_passed": True})

    assert res.verified is True
    assert res.similarity_score >= 0.85
    assert res.confidence >= 85.0
