"""FastAPI endpoints for 1:1 Facial Biometric Verification and Enrollment."""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.face import (
    FaceEnrollRequest,
    FaceEnrollResponse,
    FaceVerifyRequest,
    FaceVerifyResponse,
)
from app.core.face_engine import FaceEngine
from app.security import verify_service_key

log = logging.getLogger("face_api")

router = APIRouter(
    prefix="/ml/face",
    tags=["Biometric Face Intelligence"],
    dependencies=[Depends(verify_service_key)],
)

face_engine = FaceEngine()


@router.post("/enroll", response_model=FaceEnrollResponse, summary="Extract and generate enrolled biometric template")
async def enroll_face(req: FaceEnrollRequest):
    """Generates a 128-dimensional biometric embedding template from an authorized enrollment frame."""
    try:
        image = face_engine.decode_base64_image(req.face_image)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid biometric image frame: {str(e)}",
        )

    quality = face_engine.analyze_quality(image)
    if quality.face_count == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No face target detected in enrollment frame. Please ensure clear lighting and centered position.",
        )

    embedding, quality_score = face_engine.extract_embedding(image)

    return FaceEnrollResponse(
        success=True,
        embedding=embedding,
        quality_score=quality_score,
        model_version=face_engine.MODEL_VERSION,
        details={
            "quality": quality.model_dump(),
            "userId": req.user_id,
        },
        message="Biometric template generated and normalized successfully",
    )


@router.post("/verify", response_model=FaceVerifyResponse, summary="1:1 Facial Biometric Verification")
async def verify_face(req: FaceVerifyRequest):
    """Performs 1:1 cosine similarity verification between live camera frame and claimed user's template."""
    try:
        live_image = face_engine.decode_base64_image(req.face_image)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid live camera frame: {str(e)}",
        )

    threshold = req.threshold or face_engine.DEFAULT_THRESHOLD

    result = face_engine.verify(
        live_image=live_image,
        enrolled_template=req.enrolled_template,
        liveness_data=req.liveness_data,
        threshold=threshold,
    )

    return result
