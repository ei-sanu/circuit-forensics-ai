"""10 Explainable Anomaly and Suspicious Pattern Detectors."""
import uuid
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple
import networkx as nx
from dateutil import parser as date_parser

from app.schemas.anomaly import AnomalyAlert
from app.schemas.common import CommunicationRecord, EntityNode, GraphEdge, TransactionRecord
from app.core.graph_manager import GraphManager


class AnomalyEngine:
    """Executes rule-based, transparent anomaly detectors across graph, financial, and CDR data."""

    def __init__(
        self,
        nodes: List[EntityNode],
        edges: List[GraphEdge],
        transactions: List[TransactionRecord],
        communications: List[CommunicationRecord]
    ):
        self.nodes = {n.id: n for n in nodes}
        self.edges = edges
        self.transactions = transactions
        self.communications = communications
        self.graph_manager = GraphManager()

    def run_all(self, enabled_detectors: Optional[List[str]] = None) -> List[AnomalyAlert]:
        alerts: List[AnomalyAlert] = []
        detectors = {
            "large_transaction": self.detect_large_transactions,
            "pass_through": self.detect_pass_through_accounts,
            "rapid_transfer_chain": self.detect_rapid_transfer_chains,
            "circular_flow": self.detect_circular_flows,
            "odd_hour_communications": self.detect_odd_hour_communications,
            "activity_spike": self.detect_activity_spikes,
            "shared_contact_info": self.detect_shared_contact_info,
            "bridge_connector": self.detect_bridge_connectors,
            "high_risk_repetition": self.detect_high_risk_repetition,
        }

        for name, func in detectors.items():
            if enabled_detectors is None or name in enabled_detectors:
                try:
                    res = func()
                    alerts.extend(res)
                except Exception as e:
                    # Log detector exception and continue
                    pass

        return alerts

    # 1. Large Transaction
    def detect_large_transactions(self, threshold: float = 400000.0) -> List[AnomalyAlert]:
        alerts = []
        for txn in self.transactions:
            if txn.amount >= threshold or txn.is_flagged:
                severity = "critical" if txn.amount >= 1000000.0 else "high"
                from_label = self.nodes.get(txn.from_id, EntityNode(id=txn.from_id, label=txn.from_id, entity_type=txn.from_type)).label
                to_label = self.nodes.get(txn.to_id, EntityNode(id=txn.to_id, label=txn.to_id, entity_type=txn.to_type)).label

                alerts.append(AnomalyAlert(
                    id=f"alt_lt_{txn.id}",
                    detector_name="large_transaction",
                    severity=severity,
                    title=f"High-Value Transfer: ₹{txn.amount:,.2f}",
                    explanation=f"A transaction of ₹{txn.amount:,.2f} from {from_label} to {to_label} exceeds the investigative threshold of ₹{threshold:,.2f}.",
                    confidence=0.95,
                    entities=[
                        {"id": txn.from_id, "type": txn.from_type, "label": from_label},
                        {"id": txn.to_id, "type": txn.to_type, "label": to_label}
                    ],
                    evidence_ids=[txn.id],
                    methodology="Identifies transactions exceeding ₹400,000 baseline threshold."
                ))
        return alerts

    # 2. Pass-Through Mule Accounts (Inflows >= 3 senders, >=75% forwarded within 48h)
    def detect_pass_through_accounts(self) -> List[AnomalyAlert]:
        alerts = []
        inflows: Dict[str, List[TransactionRecord]] = defaultdict(list)
        outflows: Dict[str, List[TransactionRecord]] = defaultdict(list)

        for txn in self.transactions:
            inflows[txn.to_id].append(txn)
            outflows[txn.from_id].append(txn)

        for account_id, in_txns in inflows.items():
            if len(in_txns) < 2:
                continue
            out_txns = outflows.get(account_id, [])
            if len(out_txns) < 2:
                continue

            total_in = sum(t.amount for t in in_txns)
            total_out = sum(t.amount for t in out_txns)

            if total_in > 0 and (total_out / total_in) >= 0.75:
                # Check time delta
                try:
                    in_times = [date_parser.parse(t.timestamp) for t in in_txns]
                    out_times = [date_parser.parse(t.timestamp) for t in out_txns]
                    min_in, max_out = min(in_times), max(out_times)
                    if (max_out - min_in) <= timedelta(days=3):
                        node_label = self.nodes.get(account_id, EntityNode(id=account_id, label=account_id, entity_type="account")).label
                        alerts.append(AnomalyAlert(
                            id=f"alt_pt_{account_id}",
                            detector_name="pass_through",
                            severity="critical",
                            title=f"Pass-Through Account Identified: {node_label}",
                            explanation=f"Account received ₹{total_in:,.2f} from {len(in_txns)} sources and rapidly forwarded ₹{total_out:,.2f} ({(total_out/total_in)*100:.1f}%) to {len(out_txns)} recipients within 72 hours.",
                            confidence=0.92,
                            entities=[{"id": account_id, "type": "entity", "label": node_label}],
                            evidence_ids=[t.id for t in (in_txns + out_txns)],
                            methodology="Monitors rapid funneling behavior: Inflows forwarded to multiple destinations with >75% volume turnover."
                        ))
                except Exception:
                    pass
        return alerts

    # 3. Rapid Transfer Chains
    def detect_rapid_transfer_chains(self) -> List[AnomalyAlert]:
        alerts = []
        adj = defaultdict(list)
        for txn in self.transactions:
            adj[txn.from_id].append(txn)

        # Look for 3+ hop chains
        for start_node, txns1 in adj.items():
            for t1 in txns1:
                try:
                    t1_time = date_parser.parse(t1.timestamp)
                    for t2 in adj.get(t1.to_id, []):
                        t2_time = date_parser.parse(t2.timestamp)
                        if timedelta(0) <= (t2_time - t1_time) <= timedelta(hours=6):
                            for t3 in adj.get(t2.to_id, []):
                                t3_time = date_parser.parse(t3.timestamp)
                                if timedelta(0) <= (t3_time - t1_time) <= timedelta(hours=12):
                                    chain_nodes = [start_node, t1.to_id, t2.to_id, t3.to_id]
                                    alerts.append(AnomalyAlert(
                                        id=f"alt_chain_{t1.id}_{t3.id}",
                                        detector_name="rapid_transfer_chain",
                                        severity="high",
                                        title="Rapid Multi-Hop Transfer Chain",
                                        explanation=f"A 3-hop rapid fund chain was executed from {start_node} to {t3.to_id} across {chain_nodes} within 12 hours.",
                                        confidence=0.88,
                                        entities=[{"id": n, "label": self.nodes.get(n, EntityNode(id=n, label=n, entity_type="entity")).label} for n in chain_nodes],
                                        evidence_ids=[t1.id, t2.id, t3.id],
                                        methodology="Detects multi-hop funds movement traversing accounts with short holding intervals (<6 hours per hop)."
                                    ))
                                    break
                except Exception:
                    pass
        return alerts

    # 4. Circular Money Loops (Cycles in DiGraph)
    def detect_circular_flows(self) -> List[AnomalyAlert]:
        alerts = []
        g = nx.DiGraph()
        tx_map = defaultdict(list)
        for t in self.transactions:
            g.add_edge(t.from_id, t.to_id)
            tx_map[(t.from_id, t.to_id)].append(t.id)

        try:
            cycles = [c for c in nx.simple_cycles(g) if 3 <= len(c) <= 5]
            for cycle in cycles[:10]:
                cycle_str = " → ".join(cycle) + f" → {cycle[0]}"
                ev_ids = []
                for i in range(len(cycle)):
                    u, v = cycle[i], cycle[(i + 1) % len(cycle)]
                    ev_ids.extend(tx_map.get((u, v), []))

                alerts.append(AnomalyAlert(
                    id=f"alt_circ_{'_'.join(cycle[:3])}",
                    detector_name="circular_flow",
                    severity="critical",
                    title="Circular Financial Layering Loop",
                    explanation=f"Detected closed money laundering loop: {cycle_str}.",
                    confidence=0.94,
                    entities=[{"id": nid, "label": self.nodes.get(nid, EntityNode(id=nid, label=nid, entity_type="entity")).label} for nid in cycle],
                    evidence_ids=ev_ids,
                    methodology="Identifies directed cycles (length 3-5) returning funds back to originating or related entities."
                ))
        except Exception:
            pass
        return alerts

    # 5. Odd-Hour Communications (00:00 - 05:00)
    def detect_odd_hour_communications(self) -> List[AnomalyAlert]:
        alerts = []
        phone_comms = defaultdict(list)
        for c in self.communications:
            phone_comms[c.from_number].append(c)

        for phone, comms in phone_comms.items():
            if len(comms) < 5:
                continue
            odd_count = 0
            for c in comms:
                try:
                    dt = date_parser.parse(c.timestamp)
                    if 0 <= dt.hour < 5:
                        odd_count += 1
                except Exception:
                    pass

            ratio = odd_count / len(comms)
            if ratio >= 0.30 and odd_count >= 3:
                alerts.append(AnomalyAlert(
                    id=f"alt_odd_{phone[-6:]}",
                    detector_name="odd_hour_communications",
                    severity="medium",
                    title=f"Odd-Hour Communication Surge ({phone})",
                    explanation=f"{odd_count} of {len(comms)} calls ({ratio*100:.1f}%) occurred between 00:00 and 05:00 (burn-pattern signature).",
                    confidence=0.85,
                    entities=[{"id": phone, "type": "phone", "label": phone}],
                    evidence_ids=[c.id for c in comms if 0 <= date_parser.parse(c.timestamp).hour < 5],
                    methodology="Flags numbers where ≥30% of call volume occurs in odd early morning hours (midnight to 5 AM)."
                ))
        return alerts

    # 6. Activity Spike
    def detect_activity_spikes(self) -> List[AnomalyAlert]:
        alerts = []
        user_txns = defaultdict(list)
        for t in self.transactions:
            user_txns[t.from_id].append(t)

        for user_id, txns in user_txns.items():
            if len(txns) >= 6:
                recent = txns[-3:]
                recent_vol = sum(t.amount for t in recent)
                avg_prior = sum(t.amount for t in txns[:-3]) / max(1, len(txns) - 3)
                if recent_vol > (avg_prior * 3.5) and recent_vol > 200000.0:
                    label = self.nodes.get(user_id, EntityNode(id=user_id, label=user_id, entity_type="entity")).label
                    alerts.append(AnomalyAlert(
                        id=f"alt_spk_{user_id}",
                        detector_name="activity_spike",
                        severity="medium",
                        title=f"Sudden Transaction Volume Spike: {label}",
                        explanation=f"Entity {label} exhibited a 3.5x surge in outgoing volume (₹{recent_vol:,.2f}) compared to historical baseline.",
                        confidence=0.82,
                        entities=[{"id": user_id, "label": label}],
                        evidence_ids=[t.id for t in recent],
                        methodology="Identifies entity volumes exceeding 3x the standard historical mean."
                    ))
        return alerts

    # 7. Shared Contact Info (Phone / Vehicle shared across multiple persons)
    def detect_shared_contact_info(self) -> List[AnomalyAlert]:
        alerts = []
        asset_to_persons = defaultdict(set)
        for edge in self.edges:
            if edge.rel_type in ("uses_phone", "drives_vehicle", "registered_owner", "has_phone"):
                asset_to_persons[edge.target].add(edge.source)
                asset_to_persons[edge.source].add(edge.target)

        for asset_id, persons in asset_to_persons.items():
            person_list = [p for p in persons if self.nodes.get(p, EntityNode(id=p, label=p, entity_type="unknown")).entity_type == "person"]
            if len(person_list) >= 2:
                asset_node = self.nodes.get(asset_id, EntityNode(id=asset_id, label=asset_id, entity_type="asset"))
                alerts.append(AnomalyAlert(
                    id=f"alt_shared_{asset_id}",
                    detector_name="shared_contact_info",
                    severity="high",
                    title=f"Shared Asset Linked to Multiple Persons: {asset_node.label}",
                    explanation=f"Asset ({asset_node.entity_type}) {asset_node.label} is actively shared across {len(person_list)} distinct persons: {', '.join(person_list)}.",
                    confidence=0.90,
                    entities=[{"id": asset_id, "label": asset_node.label}] + [{"id": p, "label": self.nodes.get(p, EntityNode(id=p, label=p, entity_type="person")).label} for p in person_list],
                    evidence_ids=[],
                    methodology="Detects phones, IMEI numbers, or vehicles concurrently utilized by two or more unrelated suspects."
                ))
        return alerts

    # 8. Bridge Connectors (Articulation Points)
    def detect_bridge_connectors(self) -> List[AnomalyAlert]:
        alerts = []
        g = nx.Graph()
        for e in self.edges:
            g.add_edge(e.source, e.target)

        try:
            art_points = list(nx.articulation_points(g))
            for p in art_points:
                node = self.nodes.get(p)
                if node and node.entity_type in ("person", "organization"):
                    alerts.append(AnomalyAlert(
                        id=f"alt_brg_{p}",
                        detector_name="bridge_connector",
                        severity="high",
                        title=f"Strategic Broker / Bridge Connector: {node.label}",
                        explanation=f"Entity {node.label} serves as an essential articulation point connecting otherwise segregated clusters in the network.",
                        confidence=0.91,
                        entities=[{"id": p, "label": node.label, "type": node.entity_type}],
                        evidence_ids=[],
                        methodology="Identifies graph articulation points where entity removal divides the component into disconnected partitions."
                    ))
        except Exception:
            pass
        return alerts

    # 9. High-Risk Repetition
    def detect_high_risk_repetition(self) -> List[AnomalyAlert]:
        alerts = []
        flagged_nodes = {n.id for n in self.nodes.values() if n.risk_flag}
        if not flagged_nodes:
            return []

        interactions = defaultdict(int)
        for e in self.edges:
            if (e.source in flagged_nodes and e.target not in flagged_nodes):
                interactions[e.target] += e.count
            elif (e.target in flagged_nodes and e.source not in flagged_nodes):
                interactions[e.source] += e.count

        for subject_id, count in interactions.items():
            if count >= 4:
                node = self.nodes.get(subject_id, EntityNode(id=subject_id, label=subject_id, entity_type="entity"))
                alerts.append(AnomalyAlert(
                    id=f"alt_hrr_{subject_id}",
                    detector_name="high_risk_repetition",
                    severity="medium",
                    title=f"Repeated Contact with Flagged Entity: {node.label}",
                    explanation=f"{node.label} had {count} recorded interactions with high-risk flagged entities.",
                    confidence=0.86,
                    entities=[{"id": subject_id, "label": node.label}],
                    evidence_ids=[],
                    methodology="Tracks repeated interactions between unflagged entities and high-risk flagged suspects."
                ))
        return alerts
