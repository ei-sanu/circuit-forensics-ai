import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_database, close_database_connection, db_manager
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    http_exception_handler,
)
from app.api.router import api_router, root_router
from app.services.auth_service import auth_service
from app.services.biometric_service import biometric_service
from app.services.case_service import case_service
from app.services.entity_service import entity_service
from app.services.graph_service import graph_service
from app.services.alert_service import alert_service
from app.services.vehicle_service import vehicle_service
from app.services.document_service import document_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("CIRCUIT.Main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle manager."""
    logger.info("Starting CIRCUIT Unified Backend + ML Engine (Python + FastAPI + PostgreSQL)...")
    # Skip DB init if engine already set (e.g., injected by test suite)
    if db_manager.engine is None:
        await connect_to_database()
    
    # Auto-seed database initial state concurrently to minimize startup latency
    try:
        import asyncio
        await asyncio.gather(
            auth_service.seed_default_users(),
            biometric_service.seed_default_biometric_templates(),
            case_service.seed_demo_cases(),
            entity_service.seed_demo_entities(),
            graph_service.seed_demo_graph(),
            alert_service.seed_demo_alerts(),
            vehicle_service.seed_default_vehicles(),
            document_service.seed_demo_documents(),
            return_exceptions=True,
        )
        try:
            from app.services.rag_service import rag_service
            await rag_service.initialize()
        except Exception as e:
            logger.warning(f"RAG startup auto-init notice: {e}")
    except Exception as e:
        logger.warning(f"Startup data sync notice: {e}")

    logger.info(f"🚀 CIRCUIT Unified Backend is running on port {settings.port}")
    logger.info(f"📚 Interactive Swagger API Docs available at /docs and /api/docs")
    yield
    logger.info("Shutting down CIRCUIT Backend...")

app = FastAPI(
    title=settings.app_name,
    description=(
        "CIRCUIT — Criminal Intelligence & Relationship Investigation using Connected-Entity Tracking.\n\n"
        "Unified high-performance backend serving Core Intelligence APIs, Document AI, 1:1 Facial Biometrics, "
        "and NetworkX Graph Analytics on PostgreSQL."
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Configuration
origins = settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_origin_regex=r"https://.*\.pages\.dev|https://.*\.workers\.dev|http://localhost:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

# Include Routers
app.include_router(api_router)
app.include_router(root_router)

# Also support /api/docs and /api/openapi.json
@app.get("/api/docs", include_in_schema=False)
async def api_docs_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")

@app.get("/api/openapi.json", include_in_schema=False)
async def api_openapi_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/openapi.json")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=(settings.node_env == "development"))
