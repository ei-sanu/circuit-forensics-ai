"""NetworkX-based Graph Intelligence Manager."""
from collections import defaultdict
from typing import Dict, List, Optional, Set, Tuple
import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities

from app.schemas.common import EntityNode, GraphEdge
from app.schemas.graph import (
    CommunityInfo, GraphAnalyticsResponse, GraphMetrics, GraphState,
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
            if self.undirected.has_edge(edge.source, edge.target):
                self.undirected[edge.source][edge.target]["weight"] += edge.count
            else:
                self.undirected.add_edge(
                    edge.source,
                    edge.target,
                    weight=edge.count,
                    rel_type=edge.rel_type,
                    confidence=edge.confidence,
                    source_type=edge.source_type,
                )

    def compute_metrics(self) -> GraphMetrics:
        n = self.undirected.number_of_nodes()
        e = self.undirected.number_of_edges()
        density = nx.density(self.undirected) if n > 1 else 0.0
        degrees = [d for _, d in self.undirected.degree()]
        avg_deg = (sum(degrees) / n) if n > 0 else 0.0
        communities = self.detect_communities()

        return GraphMetrics(
            node_count=n,
            edge_count=e,
            density=round(density, 4),
            average_degree=round(avg_deg, 2),
            num_communities=len(communities)
        )

    def detect_communities(self) -> List[CommunityInfo]:
        if self.undirected.number_of_nodes() == 0:
            return []
        try:
            raw_comms = list(greedy_modularity_communities(self.undirected, weight="weight"))
        except Exception:
            raw_comms = [set(c) for c in nx.connected_components(self.undirected)]

        result: List[CommunityInfo] = []
        for idx, comm in enumerate(raw_comms):
            members = list(comm)
            result.append(CommunityInfo(
                community_id=idx,
                members=members,
                size=len(members)
            ))
        return result

    def compute_influence(self) -> Dict[str, InfluenceComponent]:
        """Calculates normalized influence scores for all person/organization nodes."""
        if self.undirected.number_of_nodes() == 0:
            return {}

        target_nodes = [
            n for n, d in self.undirected.nodes(data=True)
            if d.get("entity_type") in ("person", "organization")
        ]
        if not target_nodes:
            target_nodes = list(self.undirected.nodes())

        # Centrality metrics
        deg_map = nx.degree_centrality(self.undirected)
        bet_map = nx.betweenness_centrality(self.undirected)
        try:
            pr_map = nx.pagerank(self.digraph, weight="count", alpha=0.85)
        except Exception:
            pr_map = {n: 1.0 / len(self.digraph) for n in self.digraph.nodes()}

        # Communication volumes
        comm_vol: Dict[str, int] = defaultdict(int)
        for u, v, d in self.digraph.edges(data=True):
            if d.get("rel_type") in ("called", "communicated_with", "uses_phone"):
                comm_vol[u] += d.get("count", 1)
                comm_vol[v] += d.get("count", 1)

        # Cross-community links
        communities = self.detect_communities()
        node2com = {}
        for c in communities:
            for m in c.members:
                node2com[m] = c.community_id

        cross_comm: Dict[str, int] = defaultdict(int)
        for u, v in self.undirected.edges():
            cu, cv = node2com.get(u), node2com.get(v)
            if cu is not None and cv is not None and cu != cv:
                cross_comm[u] += 1
                cross_comm[v] += 1

        # Suspicion / risk flag component
        susp_map: Dict[str, float] = {}
        for n in target_nodes:
            data = self.nodes_data.get(n)
            susp_map[n] = 1.0 if (data and data.risk_flag) else 0.0

        # Normalization
        d_norm = _norm({n: deg_map.get(n, 0.0) for n in target_nodes})
        b_norm = _norm({n: bet_map.get(n, 0.0) for n in target_nodes})
        p_norm = _norm({n: pr_map.get(n, 0.0) for n in target_nodes})
        c_norm = _norm({n: comm_vol.get(n, 0) for n in target_nodes})
        cc_norm = _norm({n: cross_comm.get(n, 0) for n in target_nodes})

        results: Dict[str, InfluenceComponent] = {}
        for n in target_nodes:
            score = 100.0 * (
                0.30 * d_norm.get(n, 0.0) +
                0.25 * b_norm.get(n, 0.0) +
                0.25 * p_norm.get(n, 0.0) +
                0.10 * susp_map.get(n, 0.0) +
                0.05 * c_norm.get(n, 0.0) +
                0.05 * cc_norm.get(n, 0.0)
            )
            results[n] = InfluenceComponent(
                score=round(score, 2),
                degree_norm=round(d_norm.get(n, 0.0), 4),
                betweenness_norm=round(b_norm.get(n, 0.0), 4),
                pagerank_norm=round(p_norm.get(n, 0.0), 4),
                suspicion_component=round(susp_map.get(n, 0.0), 4),
                comm_frequency_norm=round(c_norm.get(n, 0.0), 4),
                cross_community=round(cc_norm.get(n, 0.0), 4),
            )
        return results

    def find_hidden_connectors(self) -> List[str]:
        """Identifies articulation points (nodes whose removal disconnects the graph)."""
        if self.undirected.number_of_nodes() < 3:
            return []
        try:
            return list(nx.articulation_points(self.undirected))
        except Exception:
            return []

    def find_shortest_path(self, source_id: str, target_id: str) -> ShortestPathResponse:
        if not self.undirected.has_node(source_id) or not self.undirected.has_node(target_id):
            return ShortestPathResponse(found=False, path=[], total_hops=0, hops=[])

        try:
            path = nx.shortest_path(self.undirected, source=source_id, target=target_id)
            hops: List[PathHop] = []
            for i in range(len(path) - 1):
                u, v = path[i], path[i + 1]
                edge_data = self.undirected[u][v]
                hops.append(PathHop(
                    source=u,
                    target=v,
                    rel_type=edge_data.get("rel_type", "connected_to"),
                    confidence=edge_data.get("confidence", 1.0),
                    source_type=edge_data.get("source_type", "explicit")
                ))
            return ShortestPathResponse(
                found=True,
                path=path,
                total_hops=len(path) - 1,
                hops=hops
            )
        except nx.NetworkXNoPath:
            return ShortestPathResponse(found=False, path=[], total_hops=0, hops=[])

    def simulate_node_removal(self, node_id: str) -> SimulationResponse:
        if not self.undirected.has_node(node_id):
            return SimulationResponse(
                removed_node=node_id,
                original_components=0,
                new_components=0,
                isolated_neighbors=[],
                impact_summary=f"Node {node_id} does not exist in the current graph."
            )

        orig_comps = nx.number_connected_components(self.undirected)
        neighbors = list(self.undirected.neighbors(node_id))

        g_copy = self.undirected.copy()
        g_copy.remove_node(node_id)
        new_comps = nx.number_connected_components(g_copy)

        isolated = [nbr for nbr in neighbors if g_copy.degree(nbr) == 0]

        delta = new_comps - orig_comps
        if delta > 0:
            impact = f"Critical broker node. Removing {node_id} fragments the network into {new_comps} components (+{delta}) and isolates {len(isolated)} nodes."
        else:
            impact = f"Non-critical connector. Removing {node_id} leaves overall component connectivity intact ({new_comps} components)."

        return SimulationResponse(
            removed_node=node_id,
            original_components=orig_comps,
            new_components=new_comps,
            isolated_neighbors=isolated,
            impact_summary=impact
        )

    def analyze_full(self) -> GraphAnalyticsResponse:
        metrics = self.compute_metrics()
        influence = self.compute_influence()
        communities = self.detect_communities()
        connectors = self.find_hidden_connectors()
        return GraphAnalyticsResponse(
            metrics=metrics,
            influence_scores=influence,
            communities=communities,
            hidden_connectors=connectors
        )
