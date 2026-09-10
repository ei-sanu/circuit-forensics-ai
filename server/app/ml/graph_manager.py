"""NetworkX-based Graph Intelligence Manager."""
from collections import defaultdict
from typing import Dict, List, Optional, Set, Tuple
import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities

from app.ml.schemas import (
    EntityNode, GraphEdge, CommunityInfo, GraphAnalyticsResponse, GraphMetrics, GraphState,
    InfluenceComponent, PathHop, ShortestPathResponse, SimulationResponse
)


def _norm(d: Dict[str, float]) -> Dict[str, float]:
    if not d:
        return {}
    vals = list(d.values())
    lo, hi = min(vals), max(vals)
    if hi - lo < 1e-12:
        return {k: 0.0 for k in d}
    return {k: (v - lo) / (hi - lo) for k, v in d.items()}


class GraphManager:
    """Encapsulates graph algorithms, centrality, influence calculation, and traversal."""

    def __init__(self, state: Optional[GraphState] = None):
        self.digraph = nx.MultiDiGraph()
        self.undirected = nx.Graph()
        self.nodes_data: Dict[str, EntityNode] = {}
        self.edges_data: List[GraphEdge] = []
        if state:
            self.load_state(state)

    def load_state(self, state: GraphState):
        self.digraph.clear()
        self.undirected.clear()
        self.nodes_data.clear()
        self.edges_data = state.edges

        for node in state.nodes:
            self.nodes_data[node.id] = node
            self.digraph.add_node(
                node.id,
                label=node.label,
                entity_type=node.entity_type,
                risk_flag=node.risk_flag,
                **node.properties
            )
            self.undirected.add_node(
                node.id,
                label=node.label,
                entity_type=node.entity_type,
                risk_flag=node.risk_flag,
                **node.properties
            )

        for edge in state.edges:
            self.digraph.add_edge(
                edge.source,
                edge.target,
                rel_type=edge.rel_type,
                count=edge.count,
                total_amount=edge.total_amount,
                confidence=edge.confidence,
                source_type=edge.source_type,
                **edge.properties
            )
            self.undirected.add_edge(
                edge.source,
                edge.target,
                rel_type=edge.rel_type,
                weight=edge.count,
                confidence=edge.confidence
            )

    def compute_influence(self) -> Dict[str, InfluenceComponent]:
        """Calculates multi-metric composite influence scores (0 to 100)."""
        if not self.undirected.nodes():
            return {}

        deg = dict(self.undirected.degree())
        deg_norm = _norm({n: float(v) for n, v in deg.items()})

        try:
            btw = nx.betweenness_centrality(self.undirected, normalized=True)
            btw_norm = _norm(btw)
        except Exception:
            btw_norm = {n: 0.0 for n in self.undirected.nodes()}

        try:
            pr = nx.pagerank(self.undirected, alpha=0.85, max_iter=100)
            pr_norm = _norm(pr)
        except Exception:
            pr_norm = {n: 0.0 for n in self.undirected.nodes()}

        comm_freq = defaultdict(int)
        for u, v, d in self.digraph.edges(data=True):
            if d.get("rel_type") in ("called", "communicated_with", "sms"):
                comm_freq[u] += d.get("count", 1)
                comm_freq[v] += d.get("count", 1)
        comm_norm = _norm({n: float(comm_freq.get(n, 0)) for n in self.undirected.nodes()})

        communities = self.detect_communities()
        node_comm = {}
        for c in communities:
            for m in c.members:
                node_comm[m] = c.community_id

        cross_comm = defaultdict(int)
        for u, v in self.undirected.edges():
            if node_comm.get(u) is not None and node_comm.get(v) is not None:
                if node_comm[u] != node_comm[v]:
                    cross_comm[u] += 1
                    cross_comm[v] += 1
        cross_norm = _norm({n: float(cross_comm.get(n, 0)) for n in self.undirected.nodes()})

        results: Dict[str, InfluenceComponent] = {}
        for nid in self.undirected.nodes():
            node = self.nodes_data.get(nid)
            suspicion = 1.0 if (node and node.risk_flag) else 0.0

            raw_score = (
                0.25 * deg_norm.get(nid, 0.0) +
                0.25 * btw_norm.get(nid, 0.0) +
                0.20 * pr_norm.get(nid, 0.0) +
                0.15 * suspicion +
                0.10 * comm_norm.get(nid, 0.0) +
                0.05 * cross_norm.get(nid, 0.0)
            )
            score = round(raw_score * 100.0, 2)

            results[nid] = InfluenceComponent(
                score=score,
                degree_norm=round(deg_norm.get(nid, 0.0), 3),
                betweenness_norm=round(btw_norm.get(nid, 0.0), 3),
                pagerank_norm=round(pr_norm.get(nid, 0.0), 3),
                suspicion_component=round(suspicion, 3),
                comm_frequency_norm=round(comm_norm.get(nid, 0.0), 3),
                cross_community=round(cross_norm.get(nid, 0.0), 3),
            )
        return results

    def detect_communities(self) -> List[CommunityInfo]:
        """Performs community detection using Louvain-style modularity optimization."""
        if not self.undirected.nodes():
            return []

        try:
            comms = list(greedy_modularity_communities(self.undirected))
        except Exception:
            comms = [set(self.undirected.nodes())]

        result = []
        for i, c in enumerate(comms):
            result.append(CommunityInfo(
                community_id=i + 1,
                members=sorted(list(c)),
                size=len(c)
            ))
        return result

    def find_hidden_connectors(self) -> List[str]:
        """Identifies articulation points (nodes whose removal increases disconnected components)."""
        if not self.undirected.nodes():
            return []
        try:
            points = list(nx.articulation_points(self.undirected))
            return sorted(points)
        except Exception:
            return []

    def get_metrics(self) -> GraphMetrics:
        """Calculates macro network topological metrics."""
        n = self.undirected.number_of_nodes()
        e = self.undirected.number_of_edges()
        density = nx.density(self.undirected) if n > 1 else 0.0
        avg_deg = sum(dict(self.undirected.degree()).values()) / n if n > 0 else 0.0
        comms = self.detect_communities()

        return GraphMetrics(
            node_count=n,
            edge_count=e,
            density=round(density, 4),
            average_degree=round(avg_deg, 2),
            num_communities=len(comms)
        )

    def shortest_path(self, source_id: str, target_id: str) -> ShortestPathResponse:
        """Finds shortest path between two entities with rich edge relationship annotations."""
        if not self.undirected.has_node(source_id) or not self.undirected.has_node(target_id):
            return ShortestPathResponse(found=False)

        try:
            path = nx.shortest_path(self.undirected, source=source_id, target=target_id)
            hops = []
            for i in range(len(path) - 1):
                u, v = path[i], path[i + 1]
                edge_data = self.undirected.get_edge_data(u, v) or {}
                hops.append(PathHop(
                    source=u,
                    target=v,
                    rel_type=edge_data.get("rel_type", "connected_to"),
                    confidence=edge_data.get("confidence", 1.0),
                    source_type="graph"
                ))
            return ShortestPathResponse(
                found=True,
                path=path,
                total_hops=len(hops),
                hops=hops
            )
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return ShortestPathResponse(found=False)

    def simulate_node_removal(self, removed_node_id: str) -> SimulationResponse:
        """Simulates disruption when a ringleader or courier is intercepted."""
        if not self.undirected.has_node(removed_node_id):
            return SimulationResponse(
                removed_node=removed_node_id,
                original_components=nx.number_connected_components(self.undirected),
                new_components=nx.number_connected_components(self.undirected),
                isolated_neighbors=[],
                impact_summary="Target node is not present in graph state."
            )

        orig_comp = nx.number_connected_components(self.undirected)
        neighbors = list(self.undirected.neighbors(removed_node_id))

        g_copy = self.undirected.copy()
        g_copy.remove_node(removed_node_id)
        new_comp = nx.number_connected_components(g_copy)

        isolated = [nbr for nbr in neighbors if g_copy.degree(nbr) == 0]

        impact = (
            f"Interception of node '{removed_node_id}' fragments graph into {new_comp} component(s) "
            f"(original: {orig_comp}). Isolates {len(isolated)} immediate connection(s): {isolated}."
        )

        return SimulationResponse(
            removed_node=removed_node_id,
            original_components=orig_comp,
            new_components=new_comp,
            isolated_neighbors=isolated,
            impact_summary=impact
        )

    def get_full_analytics(
        self,
        include_communities: bool = True,
        include_influence: bool = True,
        include_connectors: bool = True
    ) -> GraphAnalyticsResponse:
        metrics = self.get_metrics()
        influence = self.compute_influence() if include_influence else {}
        communities = self.detect_communities() if include_communities else []
        connectors = self.find_hidden_connectors() if include_connectors else []

        return GraphAnalyticsResponse(
            metrics=metrics,
            influence_scores=influence,
            communities=communities,
            hidden_connectors=connectors
        )
