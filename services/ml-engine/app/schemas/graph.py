"""Graph analytics and traversal schemas."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import EntityNode, GraphEdge


class GraphState(BaseModel):
    nodes: List[EntityNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)


class InfluenceComponent(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0)
    degree_norm: float
    betweenness_norm: float
    pagerank_norm: float
    suspicion_component: float
    comm_frequency_norm: float
    cross_community: float


class CommunityInfo(BaseModel):
    community_id: int
    members: List[str]
    size: int


class GraphAnalyticsRequest(BaseModel):
    graph: GraphState
    include_communities: bool = True
    include_influence: bool = True
    include_connectors: bool = True


class GraphMetrics(BaseModel):
    node_count: int
    edge_count: int
    density: float
    average_degree: float
    num_communities: int


class GraphAnalyticsResponse(BaseModel):
    metrics: GraphMetrics
    influence_scores: Dict[str, InfluenceComponent] = Field(default_factory=dict)
    communities: List[CommunityInfo] = Field(default_factory=list)
    hidden_connectors: List[str] = Field(default_factory=list, description="Articulation points")


class ShortestPathRequest(BaseModel):
    graph: GraphState
    source_id: str
    target_id: str


class PathHop(BaseModel):
    source: str
    target: str
    rel_type: str
    confidence: float
    source_type: str


class ShortestPathResponse(BaseModel):
    found: bool
    path: List[str] = Field(default_factory=list)
    total_hops: int = 0
    hops: List[PathHop] = Field(default_factory=list)


class SimulationRequest(BaseModel):
    graph: GraphState
    removed_node_id: str


class SimulationResponse(BaseModel):
    removed_node: str
    original_components: int
    new_components: int
    isolated_neighbors: List[str]
    impact_summary: str
