"""Unified ML endpoints for CIRCUIT ML Stack."""
import time
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status

from app.ml.schemas import (
    ExtractRequest, ExtractResponse,
    ResolveRequest, ResolveResponse,
    GraphAnalyticsRequest, GraphAnalyticsResponse,
    ShortestPathRequest, ShortestPathResponse,
    SimulationRequest, SimulationResponse,
    DetectAnomaliesRequest, DetectAnomaliesResponse,
    CopilotQueryRequest, CopilotQueryResponse,
    FaceEnrollRequest, FaceEnrollResponse,
    FaceVerifyRequest, FaceVerifyResponse,
)
from app.ml.ner_extractor import NERExtractor
from app.ml.resolver import EntityResolver
from app.ml.graph_manager import GraphManager
from app.ml.anomaly_engine import AnomalyEngine
from app.ml.copilot_engine import CopilotEngine
from app.ml.face_engine import FaceEngine

logger = logging.getLogger("CIRCUIT.MLRouter")

router = APIRouter(prefix="/ml", tags=["ML Intelligence"])

ner_extractor = NERExtractor()
entity_resolver = EntityResolver()
face_engine = FaceEngine()
copilot_engine = CopilotEngine()


@router.post("/extract", response_model=ExtractResponse, summary="Extract entities and relations from text")
async def extract_entities(req: ExtractRequest):
    start_time = time.time()
    try:
        entities, relationships = ner_extractor.extract_all(req.text)
        duration_ms = (time.time() - start_time) * 1000.0
        return ExtractResponse(
            document_id=req.document_id,
            entities=entities,
            proposed_relationships=relationships,
            execution_time_ms=round(duration_ms, 2)
        )
    except Exception as e:
        logger.error(f"NER Extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resolve", response_model=ResolveResponse, summary="Resolve entity duplicates")
async def resolve_entity(req: ResolveRequest):
    try:
        match_result = entity_resolver.resolve(
            target=req.target,
            candidates=req.candidates,
            threshold=req.threshold
        )
        return ResolveResponse(result=match_result)
    except Exception as e:
        logger.error(f"Entity resolution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/graph/analytics", response_model=GraphAnalyticsResponse, summary="Graph centrality and community metrics")
async def graph_analytics(req: GraphAnalyticsRequest):
    try:
        gm = GraphManager(req.graph)
        return gm.get_full_analytics(
            include_communities=req.include_communities,
            include_influence=req.include_influence,
            include_connectors=req.include_connectors
        )
    except Exception as e:
        logger.error(f"Graph analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/graph/shortest-path", response_model=ShortestPathResponse, summary="Compute shortest path between entities")
async def graph_shortest_path(req: ShortestPathRequest):
    try:
        gm = GraphManager(req.graph)
        return gm.shortest_path(req.source_id, req.target_id)
    except Exception as e:
        logger.error(f"Graph shortest path error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/graph/simulate", response_model=SimulationResponse, summary="Simulate node disruption")
async def graph_simulate(req: SimulationRequest):
    try:
        gm = GraphManager(req.graph)
        return gm.simulate_node_removal(req.removed_node_id)
    except Exception as e:
        logger.error(f"Graph simulation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-anomalies", response_model=DetectAnomaliesResponse, summary="Run 10 explainable anomaly detectors")
async def detect_anomalies(req: DetectAnomaliesRequest):
    start_time = time.time()
    try:
        engine = AnomalyEngine(
            nodes=req.nodes,
            edges=req.edges,
            transactions=req.transactions,
            communications=req.communications
        )
        alerts = engine.run_all(req.enabled_detectors)
        duration_ms = (time.time() - start_time) * 1000.0
        return DetectAnomaliesResponse(
            total_alerts=len(alerts),
            alerts=alerts,
            execution_time_ms=round(duration_ms, 2)
        )
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/copilot/ask", response_model=CopilotQueryResponse, summary="Investigative AI Copilot QA")
async def ask_copilot(req: CopilotQueryRequest):
    try:
        return await copilot_engine.answer_query(req)
    except Exception as e:
        logger.error(f"Copilot query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/face/enroll", response_model=FaceEnrollResponse, summary="Generate biometric template")
async def enroll_face(req: FaceEnrollRequest):
    try:
        image = face_engine.decode_base64_image(req.face_image)
        quality = face_engine.analyze_quality(image)
        if not quality.is_acceptable:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No suitable face target detected or lighting/quality is insufficient.",
            )

        embedding = face_engine.extract_embedding(image)
        quality_score = round(min(100.0, (quality.contrast * 0.5) + (quality.sharpness * 0.5)), 2)

        return FaceEnrollResponse(
            success=True,
            embedding=embedding,
            quality_score=quality_score,
            model_version=face_engine.MODEL_VERSION,
            details={"quality": quality.model_dump(), "userId": req.user_id},
            message="Biometric template generated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Face enrollment error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/face/verify", response_model=FaceVerifyResponse, summary="1:1 Facial Biometric Verification")
async def verify_face(req: FaceVerifyRequest):
    try:
        threshold = req.threshold or face_engine.DEFAULT_THRESHOLD
        res = face_engine.verify_1to1(
            probe_image_b64=req.face_image,
            enrolled_template=req.enrolled_template,
            liveness_data=req.liveness_data,
            threshold=threshold
        )
        return res
    except Exception as e:
        logger.error(f"Face verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health", summary="ML Engine Health Check")
async def ml_health():
    return {
        "status": "healthy",
        "service": "CIRCUIT Unified ML Intelligence",
        "engines": {
            "ner_extractor": "online",
            "entity_resolver": "online",
            "graph_manager": "online",
            "anomaly_engine": "online (10 detectors)",
            "copilot_engine": "online",
            "face_engine": "online (1:1 FaceNet L2)",
        }
    }
