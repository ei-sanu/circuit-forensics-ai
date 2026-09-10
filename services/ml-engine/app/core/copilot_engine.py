"""Copilot Engine for structured graph reasoning and local AI intelligence."""
import re
from typing import List, Optional
import httpx

from app.config import settings
from app.core.graph_manager import GraphManager
from app.schemas.copilot import Citation, CopilotQueryRequest, CopilotQueryResponse


class CopilotEngine:
    """Answers investigative queries with factual citations, graph context, and analytical readings."""

    def __init__(self, graph_manager: Optional[GraphManager] = None):
        self.graph_manager = graph_manager or GraphManager()

    async def answer_query(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        query_text = req.query.strip().lower()
        if req.graph:
            self.graph_manager.load_state(req.graph)

        # 1. Intent Detection
        if any(w in query_text for w in ["most influential", "top suspect", "influence", "key player", "ringleader", "ranking"]):
            return self._handle_influence_intent(req)
        elif any(w in query_text for w in ["how is", "connected to", "connection between", "path between", "route"]):
            return self._handle_path_intent(req)
        elif any(w in query_text for w in ["anomaly", "anomalies", "suspicious", "alert", "alerts", "fraud", "mule", "loop"]):
            return self._handle_anomalies_intent(req)
        elif any(w in query_text for w in ["summarize", "who is", "tell me about", "profile", "overview"]):
            return self._handle_summary_intent(req)
        else:
            return await self._handle_general_intent(req)

    def _handle_influence_intent(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        influence = self.graph_manager.compute_influence()
        sorted_nodes = sorted(influence.items(), key=lambda x: x[1].score, reverse=True)
        top5 = sorted_nodes[:5]

        facts = []
        for nid, comp in top5:
            node_data = self.graph_manager.nodes_data.get(nid)
            label = node_data.label if node_data else nid
            facts.append(
                f"{label} ({nid}): Influence Score {comp.score}/100 "
                f"(Betweenness: {comp.betweenness_norm:.2f}, PageRank: {comp.pagerank_norm:.2f}, Degree: {comp.degree_norm:.2f})"
            )

        analytical = (
            "Influence rankings are computed from multi-dimensional graph centrality: "
            "direct connections, brokerage along shortest paths, and transaction/communication volumes. "
            "High influence indicates central logistical or financial coordination within the network."
        )

        return CopilotQueryResponse(
            intent="influence_ranking",
            direct_facts=facts if facts else ["No active entities present in graph state."],
            analytical_reading=analytical,
            citations=[
                Citation(
                    source_type="graph_centrality",
                    count=len(top5),
                    description=f"Computed across {len(self.graph_manager.undirected.nodes)} nodes and {len(self.graph_manager.undirected.edges)} edges."
                )
            ],
            suggested_followups=[
                "Who are the direct associates of the top-ranked entity?",
                "What active alerts are linked to these entities?",
                "Show the shortest path between the top two coordinators."
            ]
        )

    def _handle_path_intent(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        # Extract potential entity IDs or names
        tokens = re.findall(r"\b[A-Za-z0-9\-_]+\b", req.query)
        candidates = [t for t in tokens if t in self.graph_manager.undirected.nodes]

        if len(candidates) >= 2:
            src, tgt = candidates[0], candidates[1]
            path_res = self.graph_manager.find_shortest_path(src, tgt)
            if path_res.found:
                src_label = self.graph_manager.nodes_data.get(src, None)
                tgt_label = self.graph_manager.nodes_data.get(tgt, None)
                hop_descriptions = [
                    f"Hop {idx+1}: {h.source} → ({h.rel_type}) → {h.target} [Confidence: {h.confidence*100:.0f}%]"
                    for idx, h in enumerate(path_res.hops)
                ]
                return CopilotQueryResponse(
                    intent="connection_path",
                    direct_facts=hop_descriptions,
                    analytical_reading=f"Shortest path between {src} and {tgt} resolved in {path_res.total_hops} evidential hops.",
                    citations=[
                        Citation(
                            source_type="graph_edges",
                            count=path_res.total_hops,
                            description=f"Verified through {path_res.total_hops} relationship records in the graph."
                        )
                    ],
                    suggested_followups=[
                        f"Simulate the removal of intermediate broker nodes.",
                        f"Check financial flows along this path."
                    ]
                )

        return CopilotQueryResponse(
            intent="connection_path",
            direct_facts=["Could not automatically extract 2 valid entity IDs from the question."],
            analytical_reading="Please specify exact entity IDs (e.g., 'Find connection between P-001 and O-002').",
            citations=[],
            suggested_followups=["List all available entities in this case."]
        )

    def _handle_anomalies_intent(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        hidden_connectors = self.graph_manager.find_hidden_connectors()
        facts = []
        if hidden_connectors:
            for c in hidden_connectors[:5]:
                node_data = self.graph_manager.nodes_data.get(c)
                label = node_data.label if node_data else c
                facts.append(f"Strategic Bridge Connector: {label} ({c}) - Critical articulation point.")

        return CopilotQueryResponse(
            intent="anomalies_alerts",
            direct_facts=facts if facts else ["No immediate topological bridge anomalies detected."],
            analytical_reading="Structural graph inspection reveals single points of failure (articulation nodes) whose disruption partitions the network.",
            citations=[
                Citation(
                    source_type="topological_anomaly",
                    count=len(hidden_connectors),
                    description="Computed via biconnected component and articulation analysis."
                )
            ],
            suggested_followups=[
                "Run full financial anomaly scan for circular money flows.",
                "Check for odd-hour communications across burner phones."
            ]
        )

    def _handle_summary_intent(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        metrics = self.graph_manager.compute_metrics()
        facts = [
            f"Active Network Entities: {metrics.node_count}",
            f"Verified Relational Edges: {metrics.edge_count}",
            f"Detected Community Clusters: {metrics.num_communities}",
            f"Average Connectivity Degree: {metrics.average_degree}"
        ]
        return CopilotQueryResponse(
            intent="case_summary",
            direct_facts=facts,
            analytical_reading="Overview of active case intelligence and connected graph state.",
            citations=[
                Citation(
                    source_type="case_database",
                    count=metrics.node_count,
                    description="Aggregated from current case graph state."
                )
            ],
            suggested_followups=[
                "Who are the most influential entities?",
                "Are there any circular transactions detected?"
            ]
        )

    async def _handle_general_intent(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        # If Local LLM is configured (e.g. Ollama or local API), query it
        if req.use_local_llm and settings.LLM_PROVIDER in ("local", "openai"):
            try:
                answer = await self._call_llm(req.query, req.document_summaries)
                return CopilotQueryResponse(
                    intent="general_qa",
                    direct_facts=[answer],
                    analytical_reading="Synthesized using local LLM inference over verified case context.",
                    citations=[],
                    suggested_followups=["Explain the supporting evidence.", "Show related entities."]
                )
            except Exception:
                pass

        return CopilotQueryResponse(
            intent="general_qa",
            direct_facts=[
                "CrimeGraph Copilot can answer questions on: entity influence rankings, shortest connection paths, detected fraud/mule anomalies, and case summaries."
            ],
            analytical_reading="To query specific entities, mention their name or ID (e.g. 'Who are the top suspects?' or 'How is P-001 connected to O-002?').",
            citations=[],
            suggested_followups=[
                "Who are the most influential entities in this network?",
                "What anomalies have been detected?",
                "Show case network metrics."
            ]
        )

    async def _call_llm(self, query: str, context: List[str]) -> str:
        prompt = f"Case Context:\n" + "\n".join(context[:5]) + f"\n\nQuestion: {query}\n\nAnswer concisely based ONLY on facts above:"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{settings.LOCAL_LLM_URL}/chat/completions",
                json={
                    "model": settings.MODEL_NAME,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2
                }
            )
            data = resp.json()
            return data["choices"][0]["message"]["content"]
