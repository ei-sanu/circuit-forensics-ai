import time
from typing import Dict, Any
from fastapi import APIRouter, Response, status
from app.core.database import db_manager

router = APIRouter(tags=["Health"])

start_time = time.time()

@router.get("/health", summary="Basic health and uptime check")
@router.get("/api/health", summary="Basic health and uptime check alias")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "ok",
        "service": "CIRCUIT Core API",
        "uptime": round(time.time() - start_time, 2),
        "timestamp": time.time(),
    }

@router.get("/health/live", summary="Kubernetes/Docker liveness probe")
async def liveness_probe() -> Dict[str, Any]:
    return {"status": "live"}

@router.get("/health/ready", summary="Kubernetes/Docker readiness probe (PostgreSQL & ML engine)")
async def readiness_probe(response: Response) -> Dict[str, Any]:
    db_ok = False

    # Check PostgreSQL via SQLAlchemy engine
    if db_manager.engine is not None:
        try:
            from sqlalchemy import text
            async with db_manager.engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            db_ok = True
        except Exception:
            db_ok = False

    if not db_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if db_ok else "not_ready",
        "dependencies": {
            "postgresql": "connected" if db_ok else "disconnected",
            "ml_engine": "in_process",
        },
    }
