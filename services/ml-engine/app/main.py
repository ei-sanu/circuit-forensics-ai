"""CrimeGraph ML Engine — Dedicated Microservice Entrypoint."""
import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api import extract_router, resolve_router, graph_router, anomaly_router, copilot_router, face_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
log = logging.getLogger("ml_engine")

app = FastAPI(
    title="CrimeGraph ML Engine API",
    description="Dedicated microservice for NER Extraction, Entity Resolution, NetworkX Graph Analytics, and Anomaly Detection.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_timing_and_headers(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000.0
    response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
    response.headers["X-Service-Name"] = settings.APP_NAME
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled error processing %s: %s", request.url.path, str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal ML service error: {str(exc)}"}
    )


# Mount routers
app.include_router(extract_router)
app.include_router(resolve_router)
app.include_router(graph_router)
app.include_router(anomaly_router)
app.include_router(copilot_router)
app.include_router(face_router)


@app.get("/ml/health", tags=["Health"])
async def health_check():
    """Unauthenticated health check endpoint for container orchestrators and gateways."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "llm_provider": settings.LLM_PROVIDER
    }


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": settings.APP_NAME,
        "docs": "/docs",
        "health": "/ml/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
