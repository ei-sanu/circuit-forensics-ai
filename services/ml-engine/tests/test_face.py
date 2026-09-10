"""Unit tests for FaceEngine and Biometric Verification APIs."""
import base64
import io
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.core.face_engine import FaceEngine
from app.config import settings

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Service-Key": settings.INTERNAL_SERVICE_SECRET}


def create_synthetic_face_image(seed: int = 42, brightness: int = 120) -> str:
    """Generates a synthetic base64 face-like test image with skin chrominance."""
    np.random.seed(seed)
    # Create 160x160 RGB image
    arr = np.zeros((160, 160, 3), dtype=np.uint8)
    # Background
    arr[:, :] = [40, 40, 45]
    # Central face oval
    y, x = np.ogrid[:160, :160]
    mask = ((x - 80) ** 2) / (50 ** 2) + ((y - 80) ** 2) / (65 ** 2) <= 1
    # Skin tone (R: 190, G: 140, B: 110)
    arr[mask] = [min(255, brightness + 70), min(255, brightness + 20), min(255, brightness - 10)]
    # Eyes
    eye1 = ((x - 60) ** 2) + ((y - 65) ** 2) <= 16
    eye2 = ((x - 100) ** 2) + ((y - 65) ** 2) <= 16
    arr[eye1] = [30, 30, 30]
    arr[eye2] = [30, 30, 30]
    # Mouth
    mouth = ((x - 80) ** 2) / (20 ** 2) + ((y - 110) ** 2) / (6 ** 2) <= 1
    arr[mouth] = [140, 60, 60]

    img = Image.fromarray(arr, "RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


def test_face_engine_embedding_and_quality():
    engine = FaceEngine()
    b64 = create_synthetic_face_image(seed=42)
    img = engine.decode_base64_image(b64)

    quality = engine.analyze_quality(img)
    assert quality.face_count == 1
    assert quality.is_acceptable is True

    embedding, score = engine.extract_embedding(img)
    assert len(embedding) == 128
    assert score > 50.0

    # L2 Norm should be approximately 1.0
    norm = np.linalg.norm(np.array(embedding))
    assert np.isclose(norm, 1.0, atol=1e-3)


def test_face_1to1_verification_success():
    engine = FaceEngine()
    b64 = create_synthetic_face_image(seed=100)
    img = engine.decode_base64_image(b64)
    template, _ = engine.extract_embedding(img)

    # Verification with identical image
    res = engine.verify(
        live_image=img,
        enrolled_template=template,
        liveness_data={"challengeCompleted": True, "movementScore": 0.8},
        threshold=0.78,
    )
    assert res.verified is True
    assert res.similarity_score >= 0.95
    assert res.liveness_passed is True


def test_face_api_endpoints():
    b64 = create_synthetic_face_image(seed=200)

    # 1. Enroll
    enroll_resp = client.post(
        "/ml/face/enroll",
        json={"face_image": b64, "user_id": "usr-test-01"},
        headers=AUTH_HEADERS,
    )
    assert enroll_resp.status_code == 200
    enroll_data = enroll_resp.json()
    assert enroll_data["success"] is True
    template = enroll_data["embedding"]
    assert len(template) == 128

    # 2. Verify Success
    verify_resp = client.post(
        "/ml/face/verify",
        json={
            "face_image": b64,
            "enrolled_template": template,
            "liveness_data": {"challengeCompleted": True, "movementScore": 0.9},
            "threshold": 0.78,
        },
        headers=AUTH_HEADERS,
    )
    assert verify_resp.status_code == 200
    verify_data = verify_resp.json()
    assert verify_data["verified"] is True
    assert verify_data["similarity_score"] >= 0.95
