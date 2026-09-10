"""Graph analytics API endpoints."""
from fastapi import APIRouter, Depends
from app.core.graph_manager import GraphManager
from app.schemas.graph import (
    GraphAnalyticsRequest, GraphAnalyticsResponse,
    ShortestPathRequest, ShortestPathResponse,
    SimulationRequest, SimulationResponse
)
from app.security import verify_service_key

router = APIRouter(prefix="/ml/graph", tags=["Graph Analytics"])


@router.post("/analytics", response_model=GraphAnalyticsResponse, dependencies=[Depends(verify_service_key)])
async def analyze_graph(req: GraphAnalyticsRequest) -> GraphAnalyticsResponse:
    """Computes global metrics, Louvain/modularity communities, normalized influence scores, and hidden bridges."""
    manager = GraphManager(req.graph)
    return manager.analyze_full()


@router.post("/path", response_model=ShortestPathResponse, dependencies=[Depends(verify_service_key)])
async def find_shortest_path(req: ShortestPathRequest) -> ShortestPathResponse:
    """Finds the shortest evidential path between two entity nodes with per-hop confidence."""
    manager = GraphManager(req.graph)
    return manager.find_shortest_path(req.source_id, req.target_id)


@router.post("/simulate", response_model=SimulationResponse, dependencies=[Depends(verify_service_key)])
async def simulate_removal(req: SimulationRequest) -> SimulationResponse:
    """Simulates node removal and measures network fragmentation impact."""
    manager = GraphManager(req.graph)
    return manager.simulate_node_removal(req.removed_node_id)
