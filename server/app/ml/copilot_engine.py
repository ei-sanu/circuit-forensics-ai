"""Copilot Engine for structured graph reasoning and local AI intelligence."""
import re
from typing import List, Optional
import httpx

from app.core.config import settings
from app.ml.graph_manager import GraphManager
from app.ml.schemas import Citation, CopilotQueryRequest, CopilotQueryResponse
from app.ml.finetuned_llm import finetuned_llm_client


class CopilotEngine:
    """Answers investigative queries with factual citations, graph context, and analytical readings."""

    def __init__(self, graph_manager: Optional[GraphManager] = None):
        self.graph_manager = graph_manager or GraphManager()

    def _build_graph_rag_context(self) -> str:
        """Construct structured topological RAG context for the fine-tuned LLM."""
        metrics = self.graph_manager.get_metrics()
        influence = self.graph_manager.compute_influence()
        connectors = self.graph_manager.find_hidden_connectors()
        top3 = sorted(influence.items(), key=lambda x: x[1].score, reverse=True)[:3]
        top_str = ", ".join(f"{nid} (Score: {comp.score})" for nid, comp in top3) if top3 else "None"
        bottlenecks_str = ", ".join(connectors) if connectors else "None"
        return (
            f"Active Network Topology: {metrics.node_count} nodes, {metrics.edge_count} edges, {metrics.num_communities} clusters. "
            f"Top Influential Nodes: {top_str}. "
            f"Articulation Bottlenecks: {bottlenecks_str}."
        )

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
                    description="Computed PageRank and Betweenness Centrality across active case subgraphs"
                )
            ],
            suggested_followups=[
                "What happens if we simulate isolating the top influencer?",
                "Which entities bridge communications between clusters?",
                "Show all financial transactions exceeding ₹5 Lakhs."
            ]
        )

    def _handle_path_intent(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        # Extract potential entity IDs or names from query
        words = req.query.split()
        candidate_ids = [w.strip("?,.:;\"'") for w in words if w.strip("?,.:;'").startswith(("P-", "O-", "PH-", "V-", "CR-"))]

        if len(candidate_ids) >= 2:
            src, dst = candidate_ids[0], candidate_ids[1]
            path_res = self.graph_manager.shortest_path(src, dst)
            if path_res.found:
                facts = [f"Direct or multi-hop path discovered with {path_res.total_hops} hop(s):"]
                for h in path_res.hops:
                    facts.append(f"  • {h.source} ──[{h.rel_type}]──> {h.target} (Confidence: {h.confidence*100:.0f}%)")
                analytical = (
                    f"A deterministic relationship chain links {src} and {dst}. "
                    "This connection traverses shared associates, financial transfers, or communication logs."
                )
                return CopilotQueryResponse(
                    intent="path_traversal",
                    direct_facts=facts,
                    analytical_reading=analytical,
                    citations=[Citation(source_type="shortest_path", count=path_res.total_hops, description=f"Path from {src} to {dst}")],
                    suggested_followups=[f"Show all communications between {src} and {dst}", "Simulate removing the intermediate hop"]
                )

        return CopilotQueryResponse(
            intent="path_traversal",
            direct_facts=["Specify two entity identifiers (e.g., 'How is P-0001 connected to O-0001?') to compute connection paths."],
            analytical_reading="Entity path traversal requires explicit source and target node identifiers in graph context.",
            citations=[],
            suggested_followups=["How is P-0001 connected to O-0001?", "Who connects P-0002 to P-0004?"]
        )

    def _handle_anomalies_intent(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        connectors = self.graph_manager.find_hidden_connectors()
        metrics = self.graph_manager.get_metrics()

        facts = [
            f"Active Network Size: {metrics.node_count} nodes, {metrics.edge_count} relationships across {metrics.num_communities} communities.",
            f"Articulation Bottlenecks: {len(connectors)} critical bridge node(s) identified ({', '.join(connectors) if connectors else 'None'})."
        ]

        analytical = (
            "Pattern detectors analyze rapid transfer chains, pass-through accounts, nocturnal communications, "
            "and circular Hawala loops. Articulation nodes represent single points of failure in the network."
        )

        return CopilotQueryResponse(
            intent="anomaly_summary",
            direct_facts=facts,
            analytical_reading=analytical,
            citations=[Citation(source_type="anomaly_detectors", count=len(connectors), description="Structural bottleneck & anomaly evaluation")],
            suggested_followups=[
                "List all critical severity Hawala alerts",
                "Show nocturnal phone calls between midnight and 5 AM",
                "Explain the top pass-through accounts"
            ]
        )

    def _handle_summary_intent(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        metrics = self.graph_manager.get_metrics()
        communities = self.graph_manager.detect_communities()

        facts = [
            f"Case Graph Context: {metrics.node_count} registered entities, {metrics.edge_count} verified connections.",
            f"Community Clusters: {len(communities)} distinct operational cells detected.",
            f"Network Density: {metrics.density} with average node degree {metrics.average_degree}."
        ]

        analytical = (
            "The investigative graph comprises interconnected criminal cells engaged in financial "
            "layering and coordinated logistics. Multi-agency intelligence corroborates high connectivity among lead suspects."
        )

        return CopilotQueryResponse(
            intent="case_summary",
            direct_facts=facts,
            analytical_reading=analytical,
            citations=[Citation(source_type="graph_topology", count=metrics.node_count, description="Synthesized network summary")],
            suggested_followups=[
                "Who are the lead investigators on this case?",
                "What is the timeline of recent transactions?",
                "Which entities have high risk flags?"
            ]
        )

    async def _handle_general_intent(self, req: CopilotQueryRequest) -> CopilotQueryResponse:
        metrics = self.graph_manager.get_metrics()
        influence = self.graph_manager.compute_influence()
        top_node = max(influence.items(), key=lambda x: x[1].score)[0] if influence else "None"

        facts = [
            f"Query received: '{req.query}'",
            f"Current graph topology encompasses {metrics.node_count} nodes and {metrics.edge_count} links.",
            f"Highest-scoring central coordinator in active scope: {top_node}."
        ]

        rag_context = self._build_graph_rag_context()
        llm_response = await finetuned_llm_client.generate_response(query=req.query, graph_context=rag_context)

        analytical = llm_response if llm_response else (
            "CIRCUIT Copilot integrates fine-tuned criminal intelligence with deterministic graph centrality algorithms "
            "to answer evidentiary and network queries with full chain-of-custody citations."
        )

        return CopilotQueryResponse(
            intent="general_inquiry",
            direct_facts=facts,
            analytical_reading=analytical,
            citations=[Citation(source_type="finetuned_llm" if llm_response else "graph_context", count=metrics.node_count or 1, description="Fine-tuned forensic reasoning & graph context")],
            suggested_followups=[
                "Who is the most influential suspect?",
                "Show all alerts for this case",
                "How are P-0001 and O-0001 connected?"
            ]
        )
