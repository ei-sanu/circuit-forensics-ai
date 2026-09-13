import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
import networkx as nx
from sqlalchemy import select

from app.core.database import get_session_maker
from app.core.permissions import get_current_user
from app.models.entity import Entity
from app.models.relationship import Relationship
from app.models.transaction import Transaction

logger = logging.getLogger("CIRCUIT.IntelligenceLabRouter")

router = APIRouter(prefix="/intelligence-lab", tags=["Intelligence Lab Simulations"])

class BreakpointRequest(BaseModel):
    removedNodeIds: List[str] = Field(..., json_schema_extra={"example": ["P-0001", "P-0007"]})

@router.get("/evolution", summary="Temporal evolution of graph topology over investigative weeks")
async def get_simulation_evolution(
    week: int = Query(1, ge=1, le=12),
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    maker = get_session_maker()
    async with maker() as session:
        ent_res = await session.execute(select(Entity))
        entities = [e.to_dict() for e in ent_res.scalars().all()]

        tx_res = await session.execute(select(Transaction))
        transactions = [t.to_dict() for t in tx_res.scalars().all()]

        # Scale active nodes & edges with time parameter
        active_node_count = min(len(entities), 3 + week * 2)
        active_edge_count = min(len(transactions), 2 + week * 2)

        active_nodes = entities[:active_node_count]
        active_edges = transactions[:active_edge_count]

        density = round(0.04 + (week * 0.025), 3)

        return {
            "week": week,
            "activeNodes": active_nodes,
            "activeEdges": active_edges,
            "nodeCount": len(active_nodes),
            "edgeCount": len(active_edges),
            "density": density,
            "summary": f"Week {week}: {len(active_nodes)} active entities identified with {len(active_edges)} financial/communication transit edges."
        }

@router.post("/breakpoint", summary="Simulate syndicate disruption and network fragmentation via node removal")
async def simulate_breakpoint(
    dto: BreakpointRequest,
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    maker = get_session_maker()
    async with maker() as session:
        ent_res = await session.execute(select(Entity))
        entities = ent_res.scalars().all()

        rel_res = await session.execute(select(Relationship))
        relationships = rel_res.scalars().all()

        tx_res = await session.execute(select(Transaction))
        transactions = tx_res.scalars().all()

        G = nx.Graph()
        entity_map = {}
        for e in entities:
            entity_map[e.entity_id] = e
            G.add_node(e.entity_id, label=e.name)

        for r in relationships:
            G.add_edge(r.source_id, r.target_id)
        for tx in transactions:
            if tx.sender_id and tx.receiver_id:
                G.add_edge(tx.sender_id, tx.receiver_id)

        original_node_count = G.number_of_nodes()
        if original_node_count == 0:
            return {
                "removedNodes": dto.removedNodeIds,
                "fragmentationScore": 0.0,
                "isolatedSubgraphs": 0,
                "impactAssessment": "No graph data available to simulate."
            }

        # Remove targets
        for nid in dto.removedNodeIds:
            if G.has_node(nid):
                G.remove_node(nid)

        remaining_node_count = G.number_of_nodes()
        if remaining_node_count == 0:
            fragmentation = 1.0
            components = []
        else:
            components = list(nx.connected_components(G))
            largest_cc_size = len(max(components, key=len)) if components else 0
            # Fragmentation formula: proportion of nodes disconnected from the primary component
            fragmentation = round(1.0 - (largest_cc_size / float(original_node_count)), 2)

        isolated_subgraphs = len(components)

        # Generate intelligent impact assessment
        is_high_impact = fragmentation >= 0.50
        if is_high_impact:
            assessment = (
                f"🚨 CRITICAL TACTICAL BREAKPOINT ({int(fragmentation * 100)}% Fragmentation): "
                f"Removal of {', '.join(dto.removedNodeIds)} fractures the syndicate into {isolated_subgraphs} isolated pockets. "
                "Primary capital flow channels and escort convoy communications are severed."
            )
        else:
            assessment = (
                f"⚠️ MODERATE IMPACT ({int(fragmentation * 100)}% Fragmentation): "
                f"Removal of {', '.join(dto.removedNodeIds)} eliminates peripheral nodes, but redundant bypass "
                f"channels remain operational across {isolated_subgraphs} surviving clusters."
            )

        return {
            "removedNodes": dto.removedNodeIds,
            "fragmentationScore": max(0.0, min(1.0, fragmentation)),
            "isolatedSubgraphs": isolated_subgraphs,
            "impactAssessment": assessment,
            "remainingNodes": remaining_node_count,
        }
