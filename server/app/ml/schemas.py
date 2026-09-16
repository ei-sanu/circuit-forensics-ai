"""Unified ML schemas for CIRCUIT ML stack."""
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

# --- Common Graph & Data Schemas ---
class EntityNode(BaseModel):
    id: str = Field(..., description="Unique node identifier (e.g., person:P-001 or P-001)")
    label: str = Field(..., description="Human-readable label/name")
    entity_type: str = Field(..., description="person, organization, phone, vehicle, location, event")
    properties: Dict[str, Any] = Field(default_factory=dict)
    risk_flag: bool = Field(default=False)
    aliases: List[str] = Field(default_factory=list)


class GraphEdge(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    rel_type: str = Field(..., description="called, transferred_money, associate_of, owner_of, etc.")
    count: int = Field(default=1, description="Weight/Frequency of interaction")
    total_amount: float = Field(default=0.0, description="Total amount if financial")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source_type: str = Field(default="explicit", description="explicit, cdr, financial, ai_inferred")
    properties: Dict[str, Any] = Field(default_factory=dict)


class TransactionRecord(BaseModel):
    id: str
    from_type: str = "person"
    from_id: str
    to_type: str = "organization"
    to_id: str
    amount: float
    timestamp: str
    channel: Optional[str] = "bank_transfer"
    is_flagged: bool = False


class CommunicationRecord(BaseModel):
    id: str
    from_number: str
    to_number: str
    timestamp: str
    duration_seconds: int = 0
    tower_id: Optional[str] = None
    from_person_id: Optional[str] = None
    to_person_id: Optional[str] = None


# --- Anomaly Detection Schemas ---
class AnomalyAlert(BaseModel):
    id: str
    detector_name: str
    severity: str = Field(..., description="low, medium, high, critical")
    title: str
    explanation: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    entities: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_ids: List[str] = Field(default_factory=list)
    case_id: Optional[str] = None
    methodology: str


class DetectAnomaliesRequest(BaseModel):
    nodes: List[EntityNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)
    transactions: List[TransactionRecord] = Field(default_factory=list)
    communications: List[CommunicationRecord] = Field(default_factory=list)
    enabled_detectors: Optional[List[str]] = None


class DetectAnomaliesResponse(BaseModel):
    total_alerts: int
    alerts: List[AnomalyAlert]
    execution_time_ms: float


# --- Graph Traversal & Intelligence Schemas ---
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


# --- NER Extraction Schemas ---
class ExtractedEntity(BaseModel):
    id: str = Field(..., description="Temporary identifier (e.g. temp_p_1)")
    type: str = Field(..., description="person, organization, phone, vehicle, location, money, date")
    label: str = Field(..., description="Normalized entity text or formatted string")
    original_text: str = Field(..., description="Raw text matched in document")
    span: Tuple[int, int] = Field(..., description="Character start and end offsets [start, end]")
    confidence: float = Field(..., ge=0.0, le=1.0)
    meta: Dict[str, Any] = Field(default_factory=dict)


class ProposedRelationship(BaseModel):
    source_temp_id: str
    target_temp_id: str
    rel_type: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    evidence_text: Optional[str] = None
    meta: Dict[str, Any] = Field(default_factory=dict)


class ExtractRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Raw unstructured text from FIR or document")
    document_id: Optional[str] = Field(None, description="Associated document ID")
    language: str = Field(default="en", description="Language code (en, hi)")


class ExtractResponse(BaseModel):
    document_id: Optional[str] = None
    entities: List[ExtractedEntity]
    proposed_relationships: List[ProposedRelationship]
    execution_time_ms: float


# --- Entity Resolution Schemas ---
class EntityCandidate(BaseModel):
    id: str = Field(..., description="Canonical ID in database (e.g., P-001, O-01)")
    type: str = Field(..., description="person, organization, phone, vehicle, location")
    name: str
    aliases: List[str] = Field(default_factory=list)
    attributes: Dict[str, Any] = Field(default_factory=dict)


class TargetEntity(BaseModel):
    type: str = Field(..., description="person, organization, phone, vehicle, location")
    label: str = Field(..., description="Query name or identifier")
    attributes: Dict[str, Any] = Field(default_factory=dict)


class MatchResult(BaseModel):
    matched_id: Optional[str] = Field(None, description="Matched canonical ID or None if new")
    confidence: float = Field(..., ge=0.0, le=1.0)
    decision: str = Field(..., description="'match', 'alias', or 'new_candidate'")
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    reasoning: str


class ResolveRequest(BaseModel):
    target: TargetEntity
    candidates: List[EntityCandidate] = Field(default_factory=list)
    threshold: float = Field(default=0.75, ge=0.0, le=1.0)


class ResolveResponse(BaseModel):
    result: MatchResult


# --- Biometric Face Schemas ---
class FaceQualityMetrics(BaseModel):
    brightness: float = Field(..., description="Average luminance 0-255")
    contrast: float = Field(..., description="Image dynamic range score 0-100")
    sharpness: float = Field(..., description="Laplacian spatial frequency variance")
    is_acceptable: bool = Field(..., description="Whether frame meets quality baseline")
    face_count: int = Field(..., description="Number of detected facial targets")


class FaceEnrollRequest(BaseModel):
    face_image: str = Field(..., description="Base64 encoded JPEG/PNG image or data URL")
    user_id: Optional[str] = Field(None, description="Claimed user identifier")
    liveness_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Client active liveness proof")


class FaceEnrollResponse(BaseModel):
    success: bool
    embedding: List[float] = Field(..., description="128-dimensional L2-normalized biometric embedding vector")
    quality_score: float = Field(..., description="Composite quality metric 0-100")
    model_version: str = Field(default="circuit-facenet-v1")
    details: Dict[str, Any] = Field(default_factory=dict)
    message: str = "Biometric template generated successfully"


class FaceVerifyRequest(BaseModel):
    face_image: str = Field(..., description="Base64 encoded live camera verification frame")
    enrolled_template: List[float] = Field(..., description="Decrypted 128-d reference embedding vector")
    liveness_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Active liveness signals")
    threshold: Optional[float] = Field(0.78, description="Cosine similarity acceptance threshold")


class FaceVerifyResponse(BaseModel):
    verified: bool = Field(..., description="Whether similarity meets threshold and liveness passes")
    similarity_score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
    confidence: float = Field(..., description="Statistical confidence percentage (0 to 100)")
    liveness_passed: bool = Field(..., description="Whether active presentation attack checks passed")
    model_version: str = Field(default="circuit-facenet-v1")
    reasoning: str = Field(..., description="Auditable decision rationale")
    details: Dict[str, Any] = Field(default_factory=dict)


# --- Copilot Schemas ---
class Citation(BaseModel):
    source_type: str
    count: int
    description: str


class CopilotQueryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    case_id: Optional[str] = None
    graph: Optional[GraphState] = None
    document_summaries: List[str] = Field(default_factory=list)
    use_local_llm: bool = False
    api_key: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = None



class ResearchTraceStep(BaseModel):
    tool: str = Field(..., description="Tool or analytical method executed")
    status: str = Field(default="completed", description="Execution status")
    description: str = Field(..., description="Factual description of what the tool analyzed")


class CopilotQueryResponse(BaseModel):
    intent: str
    direct_facts: List[str] = Field(default_factory=list)
    analytical_reading: str = ""
    citations: List[Citation] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    disclaimer: str = "Analytical observation based on available case data. Does not constitute a determination of guilt or criminal responsibility."

    # Enhanced AI Investigative Researcher fields
    answer: Optional[str] = None
    research_trace: List[ResearchTraceStep] = Field(default_factory=list)
    verified_evidence: List[str] = Field(default_factory=list)
    analytical_findings: List[str] = Field(default_factory=list)
    potential_connections: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_reviewed: List[Dict[str, Any]] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    how_we_reached_this: Dict[str, Any] = Field(default_factory=dict)
    follow_up_questions: List[str] = Field(default_factory=list)


# --- Link Prediction & Temporal Intelligence Schemas ---
class PredictedLink(BaseModel):
    source: str = Field(..., description="Source entity ID")
    target: str = Field(..., description="Target entity ID")
    source_label: Optional[str] = Field(None, description="Source entity name/label")
    target_label: Optional[str] = Field(None, description="Target entity name/label")
    score: float = Field(..., ge=0.0, le=1.0, description="Predicted link probability (0.0 to 1.0)")
    algorithm: str = Field(..., description="Link prediction algorithm or ensemble name")
    common_neighbors: List[str] = Field(default_factory=list, description="Common intermediary entity IDs")
    common_neighbor_names: List[str] = Field(default_factory=list, description="Common intermediary entity names")
    evidence: str = Field(..., description="Factual and topological explanation of the predicted relationship")


class PredictLinksRequest(BaseModel):
    graph: GraphState
    top_n: int = Field(default=10, ge=1, le=50)
    algorithm: Optional[str] = Field(default="ensemble", description="ensemble, adamic_adar, jaccard, common_neighbors")


class PredictLinksResponse(BaseModel):
    predicted_links: List[PredictedLink]
    total_candidates: int
    algorithm_used: str


class TemporalSlice(BaseModel):
    slice_label: str
    start_date: str
    end_date: str
    node_count: int
    edge_count: int
    transaction_volume: float
    active_nodes: List[str] = Field(default_factory=list)
    new_nodes: List[str] = Field(default_factory=list)
    new_edges: List[Dict[str, str]] = Field(default_factory=list)
    hub_nodes: List[Dict[str, Any]] = Field(default_factory=list)


class TemporalIntelligenceResponse(BaseModel):
    case_id: Optional[str]
    window_days: int
    slices: List[TemporalSlice]
    total_volume_shift_pct: float
    emerging_hubs: List[str]
    summary: str

