"""Export all API routers."""
from app.api.extract import router as extract_router
from app.api.resolve import router as resolve_router
from app.api.graph import router as graph_router
from app.api.anomaly import router as anomaly_router
from app.api.copilot import router as copilot_router
from app.api.face import router as face_router

__all__ = [
    "extract_router",
    "resolve_router",
    "graph_router",
    "anomaly_router",
    "copilot_router",
    "face_router",
]
