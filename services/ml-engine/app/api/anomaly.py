"""Anomaly detection API endpoint."""
import time
from fastapi import APIRouter, Depends
from app.core.anomaly_engine import AnomalyEngine
from app.schemas.anomaly import DetectAnomaliesRequest, DetectAnomaliesResponse
from app.security import verify_service_key

router = APIRouter(prefix="/ml", tags=["Anomaly Detection"])


@router.post("/detect-anomalies", response_model=DetectAnomaliesResponse, dependencies=[Depends(verify_service_key)])
async def detect_anomalies(req: DetectAnomaliesRequest) -> DetectAnomaliesResponse:
    """Executes 10 explainable rule-based anomaly detectors across entities, transactions, and communications."""
    start_time = time.perf_counter()
    engine = AnomalyEngine(
        nodes=req.nodes,
        edges=req.edges,
        transactions=req.transactions,
        communications=req.communications
    )
    alerts = engine.run_all(enabled_detectors=req.enabled_detectors)
    duration_ms = (time.perf_counter() - start_time) * 1000.0

    return DetectAnomaliesResponse(
        total_alerts=len(alerts),
        alerts=alerts,
        execution_time_ms=round(duration_ms, 2)
    )
