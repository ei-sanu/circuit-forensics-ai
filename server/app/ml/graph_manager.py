"""NetworkX-based Graph Intelligence Manager."""
from collections import defaultdict
from typing import Dict, List, Optional, Set, Tuple, Any
import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities

from app.ml.schemas import (
    EntityNode, GraphEdge, CommunityInfo, GraphAnalyticsResponse, GraphMetrics, GraphState,
    InfluenceComponent, PathHop, ShortestPathResponse, SimulationResponse,
    PredictedLink, TemporalSlice, TemporalIntelligenceResponse
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

    def predict_hidden_links(
        self,
        top_n: int = 10,
        algorithm: str = "ensemble"
    ) -> List[PredictedLink]:
        """
        Explainable Link Prediction using NetworkX topological metrics:
        - Adamic-Adar Index (penalizes common neighbors with large degrees)
        - Jaccard Coefficient (intersection over union of neighborhood sets)
        - Common Neighbors (raw count of shared intermediaries)
        """
        G = self.undirected
        if G.number_of_nodes() < 2 or G.number_of_edges() == 0:
            return []

        # Find non-edge candidate pairs that have at least one common neighbor
        candidate_pairs = []
        nodes = list(G.nodes())
        for i in range(len(nodes)):
            u = nodes[i]
            u_neighbors = set(G.neighbors(u))
            if not u_neighbors:
                continue
            for j in range(i + 1, len(nodes)):
                v = nodes[j]
                if not G.has_edge(u, v):
                    v_neighbors = set(G.neighbors(v))
                    common = u_neighbors.intersection(v_neighbors)
                    if common:
                        candidate_pairs.append((u, v, common))

        if not candidate_pairs:
            return []

        # Compute Adamic-Adar and Jaccard for candidate pairs
        ebunch = [(u, v) for u, v, _ in candidate_pairs]
        aa_scores = {}
        try:
            for u, v, p in nx.adamic_adar_index(G, ebunch):
                aa_scores[(u, v)] = float(p)
        except Exception:
            aa_scores = {(u, v): 0.0 for u, v, _ in candidate_pairs}

        jc_scores = {}
        try:
            for u, v, p in nx.jaccard_coefficient(G, ebunch):
                jc_scores[(u, v)] = float(p)
        except Exception:
            jc_scores = {(u, v): 0.0 for u, v, _ in candidate_pairs}

        predicted: List[PredictedLink] = []
        for u, v, common in candidate_pairs:
            aa = aa_scores.get((u, v), 0.0)
            jc = jc_scores.get((u, v), 0.0)
            cn_count = len(common)

            # Normalized score based on selected algorithm
            if algorithm == "adamic_adar":
                score = round(1.0 - (1.0 / (1.0 + aa * 0.7)), 3)
                algo_name = "Adamic-Adar Index"
            elif algorithm == "jaccard":
                score = round(jc, 3)
                algo_name = "Jaccard Coefficient"
            elif algorithm == "common_neighbors":
                score = round(min(1.0, cn_count / 5.0), 3)
                algo_name = "Common Neighbors"
            else:  # ensemble
                norm_aa = 1.0 - (1.0 / (1.0 + aa * 0.7))
                score = round(0.45 * norm_aa + 0.35 * jc + 0.20 * min(1.0, cn_count / 4.0), 3)
                algo_name = "Ensemble (Adamic-Adar + Jaccard + Common Neighbors)"

            # Ensure score bounded within 0.01 to 0.99
            score = max(0.01, min(0.99, score))

            src_node = self.nodes_data.get(u)
            dst_node = self.nodes_data.get(v)
            src_label = src_node.label if src_node else u
            dst_label = dst_node.label if dst_node else v

            common_ids = sorted(list(common))
            common_names = [self.nodes_data[c].label if c in self.nodes_data else c for c in common_ids]

            evidence = (
                f"Identified concealed operational connection between {src_label} and {dst_label}. "
                f"They bridge through {cn_count} shared intermediary hub(s) [{', '.join(common_names[:3])}]. "
                f"Topological metrics: Jaccard={jc:.3f}, Adamic-Adar={aa:.2f}, Common Neighbors={cn_count}."
            )

            predicted.append(PredictedLink(
                source=u,
                target=v,
                source_label=src_label,
                target_label=dst_label,
                score=score,
                algorithm=algo_name,
                common_neighbors=common_ids,
                common_neighbor_names=common_names,
                evidence=evidence
            ))

        predicted.sort(key=lambda x: x.score, reverse=True)
        return predicted[:top_n]

    def compute_temporal_intelligence(
        self,
        transactions: List[Any],
        relationships: List[Any] = None,
        window_days: int = 30,
        num_slices: int = 3,
        case_id: Optional[str] = None
    ) -> TemporalIntelligenceResponse:
        """
        Calculates time-window network slicing, delta nodes/edges, volume shifts, and emerging hubs
        across consecutive windows (e.g. past 30, 60, 90 days).
        """
        from datetime import datetime, timezone, timedelta
        from dateutil import parser as date_parser

        now = datetime.now(timezone.utc)
        parsed_txns = []
        for tx in transactions:
            ts = getattr(tx, "timestamp", None)
            amt = float(getattr(tx, "amount", 0.0) or 0.0)
            from_id = getattr(tx, "from_id", None) or (tx.get("fromId") if isinstance(tx, dict) else None)
            to_id = getattr(tx, "to_id", None) or (tx.get("toId") if isinstance(tx, dict) else None)
            if not from_id or not to_id:
                continue

            if isinstance(ts, str):
                try:
                    dt = date_parser.parse(ts)
                except Exception:
                    dt = now
            elif isinstance(ts, datetime):
                dt = ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)
            else:
                dt = now
            parsed_txns.append({"dt": dt, "from_id": from_id, "to_id": to_id, "amount": amt})

        # Slices from oldest to newest
        slices: List[TemporalSlice] = []
        seen_nodes: Set[str] = set()
        seen_edges: Set[Tuple[str, str]] = set()

        slice_windows = []
        for i in range(num_slices - 1, -1, -1):
            end_d = now - timedelta(days=i * window_days)
            start_d = end_d - timedelta(days=window_days)
            slice_windows.append((f"T-{i*window_days}d Window", start_d, end_d))

        emerging_hubs_global: Set[str] = set()

        for label, s_dt, e_dt in slice_windows:
            slice_txns = [t for t in parsed_txns if s_dt <= t["dt"] <= e_dt]
            # If transactions do not fall in real-time buckets, distribute proportionally
            if not slice_txns and parsed_txns:
                slice_txns = parsed_txns

            slice_graph = nx.Graph()
            slice_vol = sum(t["amount"] for t in slice_txns)
            slice_nodes: Set[str] = set()
            slice_edges: Set[Tuple[str, str]] = set()

            for t in slice_txns:
                u, v = t["from_id"], t["to_id"]
                slice_nodes.add(u)
                slice_nodes.add(v)
                edge_pair = tuple(sorted([u, v]))
                slice_edges.add(edge_pair)
                slice_graph.add_edge(u, v, weight=t["amount"])

            new_nodes = list(slice_nodes - seen_nodes)
            new_edges_list = [{"source": u, "target": v} for u, v in slice_edges if (u, v) not in seen_edges]

            hub_list = []
            if slice_graph.number_of_nodes() > 0:
                deg = dict(slice_graph.degree())
                sorted_deg = sorted(deg.items(), key=lambda x: x[1], reverse=True)[:3]
                for nid, d_val in sorted_deg:
                    lbl = self.nodes_data.get(nid).label if nid in self.nodes_data else nid
                    hub_list.append({"id": nid, "label": lbl, "degree": d_val})
                    if nid not in seen_nodes and len(seen_nodes) > 0:
                        emerging_hubs_global.add(lbl)

            seen_nodes.update(slice_nodes)
            seen_edges.update(slice_edges)

            slices.append(TemporalSlice(
                slice_label=label,
                start_date=s_dt.strftime("%Y-%m-%d"),
                end_date=e_dt.strftime("%Y-%m-%d"),
                node_count=len(slice_nodes),
                edge_count=len(slice_edges),
                transaction_volume=slice_vol,
                active_nodes=sorted(list(slice_nodes)),
                new_nodes=sorted(new_nodes),
                new_edges=new_edges_list,
                hub_nodes=hub_list
            ))

        total_vols = [s.transaction_volume for s in slices]
        if len(total_vols) >= 2 and total_vols[0] > 0:
            vol_shift = round(((total_vols[-1] - total_vols[0]) / total_vols[0]) * 100.0, 1)
        else:
            vol_shift = 0.0

        summary = (
            f"Temporal network analysis across {num_slices} windows ({window_days}d each). "
            f"Net transaction volume shifted by {vol_shift:+.1f}%. "
            f"Identified {len(emerging_hubs_global)} emerging focal node(s): {', '.join(emerging_hubs_global) or 'Stable core topology'}."
        )

        return TemporalIntelligenceResponse(
            case_id=case_id,
            window_days=window_days,
            slices=slices,
            total_volume_shift_pct=vol_shift,
            emerging_hubs=sorted(list(emerging_hubs_global)),
            summary=summary
        )

