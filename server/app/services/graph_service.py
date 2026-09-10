import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, func, desc, or_
import networkx as nx

from app.core.database import get_session_maker
from app.models.entity import Entity
from app.models.relationship import Relationship
from app.models.transaction import Transaction, Communication
from app.integrations.ml_client import ml_client

logger = logging.getLogger("CIRCUIT.GraphService")

class GraphService:
    async def seed_demo_graph(self):
        """Seed default relationships and network connections in PostgreSQL."""
        maker = get_session_maker()
        async with maker() as session:
            rel_cnt = (await session.execute(select(func.count()).select_from(Relationship))).scalar() or 0
            if rel_cnt < 15:
                now = datetime.now(timezone.utc)
                relationships_to_seed = [
                    # CR-2026-00124 (Operation Nightfall)
                    {"source_id": "P-0001", "target_id": "P-0002", "rel_type": "associated_with", "weight": 8, "confidence": 0.95, "case_id": "CR-2026-00124"},
                    {"source_id": "P-0002", "target_id": "P-0003", "rel_type": "associated_with", "weight": 5, "confidence": 0.90, "case_id": "CR-2026-00124"},
                    {"source_id": "P-0002", "target_id": "O-0001", "rel_type": "employed_by", "weight": 1, "confidence": 0.99, "case_id": "CR-2026-00124"},
                    {"source_id": "P-0001", "target_id": "PH-0001", "rel_type": "owns", "weight": 1, "confidence": 0.95, "case_id": "CR-2026-00124"},
                    {"source_id": "P-0001", "target_id": "V-0001", "rel_type": "owns", "weight": 1, "confidence": 0.92, "case_id": "CR-2026-00124"},
                    {"source_id": "P-0003", "target_id": "O-0001", "rel_type": "transferred_money_to", "weight": 3, "confidence": 0.94, "total_amount": 1800000, "case_id": "CR-2026-00124"},

                    # CR-2026-00842 (Operation Goldcrest)
                    {"source_id": "P-0004", "target_id": "O-0002", "rel_type": "employed_by", "weight": 1, "confidence": 0.99, "case_id": "CR-2026-00842"},
                    {"source_id": "P-0004", "target_id": "P-0005", "rel_type": "associated_with", "weight": 6, "confidence": 0.93, "case_id": "CR-2026-00842"},
                    {"source_id": "P-0005", "target_id": "O-0003", "rel_type": "owns", "weight": 1, "confidence": 0.96, "case_id": "CR-2026-00842"},
                    {"source_id": "P-0004", "target_id": "PH-0002", "rel_type": "owns", "weight": 1, "confidence": 0.95, "case_id": "CR-2026-00842"},
                    {"source_id": "P-0005", "target_id": "V-0002", "rel_type": "owns", "weight": 1, "confidence": 0.89, "case_id": "CR-2026-00842"},
                    {"source_id": "O-0002", "target_id": "O-0001", "rel_type": "transferred_money_to", "weight": 4, "confidence": 0.96, "total_amount": 14500000, "case_id": "CR-2026-00842"},
                    {"source_id": "P-0001", "target_id": "P-0004", "rel_type": "communicated_with", "weight": 18, "confidence": 0.97, "case_id": "CR-2026-00842"},

                    # CR-2026-00315 (Operation Red Sand)
                    {"source_id": "P-0006", "target_id": "O-0004", "rel_type": "employed_by", "weight": 1, "confidence": 0.98, "case_id": "CR-2026-00315"},
                    {"source_id": "P-0006", "target_id": "P-0007", "rel_type": "associated_with", "weight": 7, "confidence": 0.91, "case_id": "CR-2026-00315"},
                    {"source_id": "P-0006", "target_id": "V-0003", "rel_type": "owns", "weight": 1, "confidence": 0.92, "case_id": "CR-2026-00315"},
                    {"source_id": "P-0007", "target_id": "O-0004", "rel_type": "employed_by", "weight": 1, "confidence": 0.95, "case_id": "CR-2026-00315"},
                    {"source_id": "O-0004", "target_id": "O-0001", "rel_type": "associated_with", "weight": 2, "confidence": 0.88, "case_id": "CR-2026-00315"},
                    {"source_id": "P-0007", "target_id": "P-0002", "rel_type": "traveled_with", "weight": 3, "confidence": 0.90, "case_id": "CR-2026-00315"},

                    # CR-2026-00489 (Project Phantom)
                    {"source_id": "P-0008", "target_id": "O-0005", "rel_type": "employed_by", "weight": 1, "confidence": 0.99, "case_id": "CR-2026-00489"},
                    {"source_id": "P-0008", "target_id": "P-0009", "rel_type": "associated_with", "weight": 5, "confidence": 0.94, "case_id": "CR-2026-00489"},
                    {"source_id": "P-0009", "target_id": "O-0005", "rel_type": "transferred_money_to", "weight": 6, "confidence": 0.96, "total_amount": 4200000, "case_id": "CR-2026-00489"},
                    {"source_id": "P-0008", "target_id": "V-0004", "rel_type": "owns", "weight": 1, "confidence": 0.89, "case_id": "CR-2026-00489"},
                    {"source_id": "O-0005", "target_id": "O-0003", "rel_type": "transferred_money_to", "weight": 8, "confidence": 0.95, "total_amount": 6800000, "case_id": "CR-2026-00489"},
                    {"source_id": "P-0009", "target_id": "P-0004", "rel_type": "communicated_with", "weight": 12, "confidence": 0.92, "case_id": "CR-2026-00489"},

                    # CR-2026-00712 (Operation Eastern Corridor)
                    {"source_id": "P-0010", "target_id": "O-0006", "rel_type": "employed_by", "weight": 1, "confidence": 0.97, "case_id": "CR-2026-00712"},
                    {"source_id": "P-0010", "target_id": "P-0011", "rel_type": "associated_with", "weight": 6, "confidence": 0.90, "case_id": "CR-2026-00712"},
                    {"source_id": "P-0011", "target_id": "V-0005", "rel_type": "owns", "weight": 1, "confidence": 0.88, "case_id": "CR-2026-00712"},
                    {"source_id": "P-0011", "target_id": "O-0006", "rel_type": "employed_by", "weight": 1, "confidence": 0.94, "case_id": "CR-2026-00712"},
                    {"source_id": "O-0006", "target_id": "O-0004", "rel_type": "associated_with", "weight": 3, "confidence": 0.87, "case_id": "CR-2026-00712"},
                    {"source_id": "P-0010", "target_id": "P-0003", "rel_type": "communicated_with", "weight": 9, "confidence": 0.91, "case_id": "CR-2026-00712"},
                    {"source_id": "PH-0001", "target_id": "PH-0002", "rel_type": "communicated_with", "weight": 22, "confidence": 0.99, "case_id": "CR-2026-00124"},
                ]

                for rel_data in relationships_to_seed:
                    res = await session.execute(
                        select(Relationship).where(
                            (Relationship.source_id == rel_data["source_id"]) &
                            (Relationship.target_id == rel_data["target_id"]) &
                            (Relationship.rel_type == rel_data["rel_type"])
                        )
                    )
                    existing = res.scalar_one_or_none()
                    if not existing:
                        rel_obj = Relationship(**rel_data, created_at=now)
                        session.add(rel_obj)

                # Seed transactions
                txns = [
                    {"transaction_id": "TXN-001", "from_type": "person", "from_id": "P-0003", "to_type": "organization", "to_id": "O-0001", "amount": 1800000, "timestamp": now, "channel": "RTGS", "is_flagged": True, "case_id": "CR-2026-00124"},
                    {"transaction_id": "TXN-002", "from_type": "organization", "from_id": "O-0002", "to_type": "organization", "to_id": "O-0001", "amount": 14500000, "timestamp": now, "channel": "SWIFT", "is_flagged": True, "case_id": "CR-2026-00842"},
                ]
                for t in txns:
                    t_res = await session.execute(select(Transaction).where(Transaction.transaction_id == t["transaction_id"]))
                    if not t_res.scalar_one_or_none():
                        session.add(Transaction(**t))

                # Seed communications
                comms = [
                    {"communication_id": "COMM-001", "from_number": "+919876543210", "to_number": "+971501234567", "timestamp": now, "duration": 340, "from_person_id": "P-0001", "to_person_id": "P-0004", "type": "voice_call", "case_id": "CR-2026-00124"},
                    {"communication_id": "COMM-002", "from_number": "+919444123456", "to_number": "+919876543210", "timestamp": now, "duration": 180, "from_person_id": "P-0006", "to_person_id": "P-0001", "type": "sms", "case_id": "CR-2026-00315"},
                ]
                for c in comms:
                    c_res = await session.execute(select(Communication).where(Communication.communication_id == c["communication_id"]))
                    if not c_res.scalar_one_or_none():
                        session.add(Communication(**c))

                await session.commit()
                logger.info("Demo graph relationships, transactions, and communications synchronized in PostgreSQL.")

    async def get_graph_state(self, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Get nodes and edges formatted for Cytoscape.js rendering."""
        maker = get_session_maker()
        nodes = []
        edges = []

        async with maker() as session:
            e_res = await session.execute(select(Entity))
            all_entities = e_res.scalars().all()

            for e in all_entities:
                e_dict = e.to_dict()
                if case_id:
                    cases_list = e_dict.get("cases") or []
                    if case_id not in cases_list:
                        continue
                nodes.append({
                    "id": e.entity_id,
                    "label": e.name,
                    "entity_type": e.type,
                    "risk_flag": e.risk_flag,
                    "properties": e.properties or {},
                })

            r_query = select(Relationship)
            if case_id:
                r_query = r_query.where(Relationship.case_id == case_id)
            r_res = await session.execute(r_query)
            all_rels = r_res.scalars().all()

            for r in all_rels:
                edges.append({
                    "source": r.source_id,
                    "target": r.target_id,
                    "rel_type": r.rel_type,
                    "count": int(r.weight or 1),
                    "total_amount": float(r.total_amount or 0.0),
                    "confidence": float(r.confidence or 0.95),
                    "source_type": "explicit",
                    "properties": r.properties or {},
                })

        return {"nodes": nodes, "edges": edges}

    async def get_analytics(self, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Compute NetworkX graph analytics and community clusters."""
        graph_state = await self.get_graph_state(case_id)
        analytics_res = await ml_client.analyze_graph(graph_state)

        influence_scores = analytics_res.get("influence_scores", {})
        if influence_scores:
            maker = get_session_maker()
            async with maker() as session:
                for entity_id, info in influence_scores.items():
                    if isinstance(info, dict) and "score" in info:
                        res = await session.execute(select(Entity).where(Entity.entity_id == entity_id))
                        e = res.scalar_one_or_none()
                        if e:
                            e.influence_score = float(info["score"])
                await session.commit()

        return {
            "graph": graph_state,
            "analytics": analytics_res,
        }

    async def find_shortest_path(self, source_id: str, target_id: str, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Find evidential shortest path between two nodes."""
        graph_state = await self.get_graph_state(case_id)
        G = nx.Graph()
        for node in graph_state["nodes"]:
            G.add_node(node["id"], **node)
        for edge in graph_state["edges"]:
            G.add_edge(edge["source"], edge["target"], weight=edge.get("count", 1), rel_type=edge.get("rel_type"))

        if not G.has_node(source_id) or not G.has_node(target_id):
            return {"found": False, "path": [], "length": 0, "hops": []}

        try:
            path = nx.shortest_path(G, source=source_id, target=target_id)
            hops = []
            for i in range(len(path) - 1):
                u, v = path[i], path[i + 1]
                edge_data = G.get_edge_data(u, v) or {}
                hops.append({
                    "source": u,
                    "target": v,
                    "rel_type": edge_data.get("rel_type", "associated_with"),
                    "weight": edge_data.get("weight", 1),
                })
            return {"found": True, "path": path, "length": len(path) - 1, "hops": hops}
        except nx.NetworkXNoPath:
            return {"found": False, "path": [], "length": 0, "hops": []}

    async def simulate_removal(self, node_id: str, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Simulate removing a node to measure network fragmentation."""
        graph_state = await self.get_graph_state(case_id)
        G = nx.Graph()
        for node in graph_state["nodes"]:
            G.add_node(node["id"])
        for edge in graph_state["edges"]:
            G.add_edge(edge["source"], edge["target"])

        baseline_components = nx.number_connected_components(G) if len(G) > 0 else 0
        if G.has_node(node_id):
            G.remove_node(node_id)
        fragmented_components = nx.number_connected_components(G) if len(G) > 0 else 0

        return {
            "removedNodeId": node_id,
            "baselineComponents": baseline_components,
            "newComponents": fragmented_components,
            "networkDisrupted": fragmented_components > baseline_components,
            "remainingNodesCount": len(G.nodes()),
            "remainingEdgesCount": len(G.edges()),
        }

    async def get_transactions(self, case_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List transaction records."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(Transaction)
            if case_id:
                query = query.where(Transaction.case_id == case_id)
            query = query.order_by(desc(Transaction.timestamp)).limit(limit)
            res = await session.execute(query)
            txns = res.scalars().all()
            return [t.to_dict() for t in txns]

    async def get_communications(self, case_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List CDR communication records."""
        maker = get_session_maker()
        async with maker() as session:
            query = select(Communication)
            if case_id:
                query = query.where(Communication.case_id == case_id)
            query = query.order_by(desc(Communication.timestamp)).limit(limit)
            res = await session.execute(query)
            comms = res.scalars().all()
            return [c.to_dict() for c in comms]

graph_service = GraphService()
