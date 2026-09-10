from fastapi import APIRouter
from app.api.routes import (
    auth,
    biometric,
    cases,
    entities,
    documents,
    graph,
    firs,
    alerts,
    copilot,
    audit,
    health,
    ml,
)

api_router = APIRouter(prefix="/api")

# Include subrouters under /api
api_router.include_router(auth.router)
api_router.include_router(biometric.router)
api_router.include_router(cases.router)
api_router.include_router(entities.router)
api_router.include_router(documents.router)
api_router.include_router(graph.router)
api_router.include_router(firs.router)
api_router.include_router(alerts.router)
api_router.include_router(copilot.router)
api_router.include_router(audit.router)
api_router.include_router(ml.router)

# Root level routes (/firs, /ml/*, /health)
root_router = APIRouter()
root_router.include_router(health.router)
root_router.include_router(firs.router)
root_router.include_router(ml.router)
