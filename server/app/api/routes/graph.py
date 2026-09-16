from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, Body
from app.core.permissions import get_current_user, require_roles, Role
from app.services.graph_service import graph_service
from app.schemas.graph import GraphSimulateDto

router = APIRouter(prefix="/graph", tags=["Graph & Entity Analytics"])

@router.get("", summary="Get current graph state (nodes and edges) for Cytoscape visualization")
async def get_graph(
    caseId: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await graph_service.get_graph_state(case_id=caseId)

@router.get("/analytics", summary="Compute NetworkX analytics, community clusters, influence scores, and hidden bridges")
async def get_analytics(
    caseId: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await graph_service.get_analytics(case_id=caseId)

@router.get("/path", summary="Find the shortest evidential path between two entity nodes")
async def find_path(
    sourceId: str = Query(...),
    targetId: str = Query(...),
    caseId: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await graph_service.find_shortest_path(source_id=sourceId, target_id=targetId, case_id=caseId)

@router.post("/simulate", summary="Simulate node removal to analyze fragmentation of the criminal network")
async def simulate_removal(
    dto: GraphSimulateDto,
    caseId: Optional[str] = None,
    user: Dict[str, Any] = Depends(require_roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION)),
):
    return await graph_service.simulate_removal(node_id=dto.nodeId, case_id=caseId)

@router.get("/transactions", summary="Get financial transaction logs from database")
async def get_transactions(
    caseId: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await graph_service.get_transactions(case_id=caseId, limit=limit)

@router.get("/communications", summary="Get CDR communications and burner phone logs from database")
async def get_communications(
    caseId: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await graph_service.get_communications(case_id=caseId, limit=limit)

@router.get("/predict-links", summary="Predict hidden links via Adamic-Adar, Jaccard, and Common Neighbors")
async def get_predicted_links(
    caseId: Optional[str] = None,
    topN: int = Query(10, ge=1, le=50),
    algorithm: str = Query("ensemble", pattern="^(ensemble|adamic_adar|jaccard|common_neighbors)$"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await graph_service.predict_links(case_id=caseId, top_n=topN, algorithm=algorithm)

@router.post("/predict-links", summary="Predict hidden links via Adamic-Adar, Jaccard, and Common Neighbors")
async def post_predicted_links(
    body: Optional[Dict[str, Any]] = Body(default={}),
    user: Dict[str, Any] = Depends(get_current_user),
):
    case_id = body.get("caseId") or body.get("case_id")
    top_n = int(body.get("topN") or body.get("top_n") or 10)
    algorithm = body.get("algorithm", "ensemble")
    return await graph_service.predict_links(case_id=case_id, top_n=top_n, algorithm=algorithm)

@router.get("/temporal-slice", summary="Compute temporal network slicing, delta analysis, and volume shifts")
async def get_temporal_slice(
    caseId: Optional[str] = None,
    windowDays: int = Query(30, ge=7, le=180),
    numSlices: int = Query(3, ge=2, le=12),
    user: Dict[str, Any] = Depends(get_current_user),
):
    return await graph_service.get_temporal_intelligence(case_id=caseId, window_days=windowDays, num_slices=numSlices)

