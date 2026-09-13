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
    vehicles,
    insights,
    intelligence_lab,
    transactions,
    communications,
    timeline,
    evidence,
    reports,
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
api_router.include_router(vehicles.router)
api_router.include_router(insights.router)
api_router.include_router(intelligence_lab.router)
api_router.include_router(transactions.router)
api_router.include_router(communications.router)
api_router.include_router(timeline.router)
api_router.include_router(evidence.router)
api_router.include_router(reports.router)

# Root level routes (/firs, /ml/*, /health, /vehicles, /insights, /transactions, /communications, /timeline, /reports)
root_router = APIRouter()
root_router.include_router(health.router)
root_router.include_router(firs.router)
root_router.include_router(ml.router)
root_router.include_router(vehicles.router)
root_router.include_router(insights.router)
root_router.include_router(intelligence_lab.router)
root_router.include_router(transactions.router)
root_router.include_router(communications.router)
root_router.include_router(timeline.router)
root_router.include_router(reports.router)

