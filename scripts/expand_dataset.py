"""Expand CIRCUIT 2.0 training and validation datasets with specialized domain intelligence."""
import json
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAIN_FILE = os.path.join(ROOT_DIR, "data", "train.jsonl")
VAL_FILE = os.path.join(ROOT_DIR, "data", "val.jsonl")

NEW_TRAIN_SAMPLES = [
    # --- Category 1: Legal Grounding & Evidence Law ---
    {
        "instruction": "Explain the statutory requirements for electronic evidence admissibility under Section 63 of Bharatiya Sakshya Adhiniyam (BSA), 2023.",
        "input": "Evidence Type: Call Detail Records (CDR) and extracted mobile WhatsApp chats from seized device Samsung S24 (SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855).",
        "output": "STATUTORY ELECTRONIC EVIDENCE BRIEFING (SECTION 63 BSA, 2023):\n\n1. Mandatory Conditions:\n   • Section 63(2)(a): Device regularly used to store/process information during material operational period.\n   • Section 63(2)(b): Information regularly supplied to the device in the ordinary course of legitimate activities.\n   • Section 63(2)(c): System operated properly with no integrity compromise.\n   • Section 63(2)(d): Extracted record faithfully reproduces the original stored digital artifact.\n2. Cryptographic Digest: SHA-256 hash must be sealed immediately upon physical acquisition via write-blocker.\n3. Schedule Compliance: Certificate must be signed by the Cyber Forensic Examiner and Investigating Officer detailing software versions, extraction timestamps, and physical chain of custody."
    },
    {
        "instruction": "Evaluate the statutory chargesheet deadline and default bail risks under Section 187 Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.",
        "input": "Case: CR-2026-00188 (DarkNet UPI Syndicate). Arrest Date: 2026-01-20. Offenses: BNS 318 (Cheating), BNS 111 (Organized Crime). Current Date: Day 76 in judicial custody.",
        "output": "STATUTORY CHARGESHEET DEADLINE ALERT (SECTION 187 BNSS, 2023):\n\n1. Statutory Period: For offenses punishable with imprisonment of 10 years or more (such as Organized Crime under BNS Section 111), statutory custody window is 90 days.\n2. Timeline Status: 76 days elapsed. Exactly 14 days remaining before mandatory Section 187(2) default bail takes effect.\n3. Critical Directive: Investigating team must file the preliminary or final chargesheet with digital forensic lab reports before Day 90 to prevent automatic statutory release of the 4 arrested syndicate operators."
    },
    {
        "instruction": "Draft an emergency application strategy for provisional property attachment under Section 5 Prevention of Money Laundering Act (PMLA), 2002.",
        "input": "Target Entities: NorthStar Logistics Pvt Ltd (CIN: U63090MH2021PTC369124) and Apex Factoring (Account ACC-918237). Proceeds of Crime Tracked: ₹5.28 Crore across 8 mule accounts.",
        "output": "PMLA SECTION 5 PROVISIONAL ATTACHMENT STRATEGY:\n\n1. Statutory Grounds: Director/Officer has reason to believe (recorded in writing) that proceeds of crime are likely to be concealed, transferred, or dealt with in a manner frustrating confiscation.\n2. Provisional Freeze: Issue 180-day provisional attachment order freezing Account ACC-918237 and corporate assets of NorthStar Logistics.\n3. Reverse Onus (Section 24 PMLA): Statutory burden of proving that seized assets are untainted property rests squarely on the respondent corporate directors.\n4. Filing: Submit confirmation petition before the PMLA Adjudicating Authority within 30 days of provisional order."
    },
    {
        "instruction": "Distinguish between IPC Section 420 and Bharatiya Nyaya Sanhita (BNS) Section 318 in financial cheating syndicates.",
        "input": "Offense: Multi-crore fraudulent factoring invoice discount scam executed across interstate logistics firms.",
        "output": "STATUTORY CONVERSION ANALYSIS:\n\n• Repealed Section: Section 420 IPC (Cheating and dishonestly inducing delivery of property).\n• New Enactment: Section 318 BNS (2023) — Cheating.\n• Subsection 318(4): Specifically criminalizes cheating and dishonestly inducing delivery of property with rigorous imprisonment up to 7 years and fine.\n• Conjoint Invocation: For organized financial fraud networks, invoke Section 111 BNS (Organized Crime) alongside Section 318(4) BNS to invoke extended detention limits and mandatory minimum sentences."
    },

    # --- Category 2: Graph Reasoning & Network Topology ---
    {
        "instruction": "Analyze graph centrality metrics to identify the critical single point of failure in the syndicate.",
        "input": "Case CR-2026-00124: Vikram Rathore (Betweenness: 0.94, Degree: 12), Sunil Verma (Betweenness: 0.12, Degree: 4), Dinesh Kulkarni (Betweenness: 0.28, Degree: 5), Rashid Al-Mansoor (Betweenness: 0.76, Degree: 8).",
        "output": "GRAPH CENTRALITY & ARTICULATION ANALYSIS:\n\n1. Single Point of Failure (SPOF): Vikram Rathore (Betweenness Centrality: 0.94).\n2. Topological Significance: Serves as the sole articulation bottleneck bridging domestic pass-through mule operators to offshore bullion liquidation channels.\n3. Disruption Simulation: Removal of Vikram Rathore fragments the network into 3 disconnected components with an 86.4% collapse in reachable paths.\n4. Tactical Directive: Execute simultaneous custodial interception of Vikram Rathore while freezing secondary broker Rashid Al-Mansoor to prevent route reconfiguration."
    },
    {
        "instruction": "Simulate network fragmentation when key articulation connectors are removed.",
        "input": "Network: 14 nodes, 22 edges. Target nodes targeted for coordinated arrest: Node P-0001 (Vikram Rathore) and Node O-0001 (NorthStar Logistics).",
        "output": "NETWORK BREAKPOINT SIMULATION REPORT:\n\n• Baseline State: 1 connected primary giant component.\n• Disrupted State: 4 isolated subgraphs, 5 orphaned leaf nodes.\n• Fragmentation Score: 0.78 (Critical Disruption Threshold exceeded).\n• Cash Flow Impact: Eliminates 94% of transit liquidity routing between Western logistics convoys and Dubai token settlement desks.\n• Recommendation: Coordinated simultaneous action recommended to avoid alerting peripheral mules."
    },
    {
        "instruction": "Explain how PageRank and Degree Centrality identify hidden leaders versus operational couriers.",
        "input": "Suspect A has degree 18 but PageRank 0.04. Suspect B has degree 4 but PageRank 0.38 and connects directly to 3 high-centrality shell company bank directors.",
        "output": "TOPOLOGICAL HIERARCHY EVALUATION:\n\n1. Suspect A (High Degree, Low PageRank): Operational Ground Mule / Call Center Operator. High transaction/call frequency with low-importance peripheral nodes.\n2. Suspect B (Low Degree, High PageRank): Covert Syndicate Controller / Ringleader. Maintains low operational footprint to evade surveillance, but incoming edges originate from highly authoritative capital nodes.\n3. Investigative Focus: Target Suspect B for custodial interrogation and warrant execution."
    },

    # --- Category 3: Financial Forensics & Hawala Analysis ---
    {
        "instruction": "Detect pass-through mule account mechanics and calculate liquidity retention.",
        "input": "Account: ACC-918237 (NexaPay Solutions). Total Inflow (24h): ₹1,02,40,000. Total Outflow (24h): ₹99,80,000. Average holding time: 42 minutes.",
        "output": "FINANCIAL FORENSIC ASSESSMENT — PASS-THROUGH MULE DISPERSAL:\n\n1. Retention Ratio: 97.46% liquidity pass-through (Total In: ₹1.02 Cr, Total Out: ₹99.8 Lakh).\n2. Dwell Velocity: Rapid turnaround averaging 42 minutes indicates automated layering script rather than legitimate business capital retention.\n3. PAN Evasion Footprint: Dispersed outward via 182 sub-₹50,000 transfers.\n4. Statutory Classification: Money laundering conduit under PMLA Section 3; trigger emergency freeze under PMLA Section 5."
    },
    {
        "instruction": "Explain PAN evasion structuring (smurfing) under Section 139A of the Income Tax Act.",
        "input": "Target Account received 40 transactions of exactly ₹48,500, ₹49,000, and ₹49,500 from 12 distinct UPI IDs within 48 hours.",
        "output": "STRUCTURING & SMURFING FORENSIC PROFILE:\n\n1. Modus Operandi: Deliberate fragmentation of large sums into micro-deposits bounded between ₹45,000 and ₹49,999.\n2. Regulatory Threshold: Rule 114B of Income Tax Rules mandates quoting PAN for bank deposits exceeding ₹50,000. Structuring at ₹48,500-₹49,500 evades automated Core Banking System (CBS) PAN verification triggers.\n3. Total Volume: Aggregated volume ₹19.6 Lakh without statutory PAN declaration.\n4. Recommended Action: Transmit automated CTR/STR disclosure to Financial Intelligence Unit - India (FIU-IND) and initiate Section 271F penalty proceedings."
    },
    {
        "instruction": "Trace a cross-border Hawala token settlement corridor between Mumbai and Dubai DMCC.",
        "input": "Transaction Chain: Domestic cash handed to Angadiya courier in Zaveri Bazaar -> Token serial #TX-9021 confirmed via Signal -> Gold bullion liquidation credited in Dubai DMCC Gold Souk.",
        "output": "HAWALA TOKEN SETTLEMENT RECONSTRUCTION:\n\n1. Handshake Phase: Physical fiat deposited with domestic Angadiya courier against unique currency note serial number (Token #TX-9021).\n2. Layering Phase: No banking SWIFT trail; electronic validation executed via end-to-end encrypted messaging channels.\n3. Offshore Liquidation: Dubai counterparty releases gold bullion value parity at DMCC spot price, effectively completing international capital flight outside sovereign banking supervision.\n4. Enforcement Directive: Coordinate with Directorate of Enforcement (ED) and execute Mutual Legal Assistance Treaty (MLAT) requests with UAE Ministry of Justice."
    },

    # --- Category 4: Temporal Network Evolution ---
    {
        "instruction": "Analyze temporal network evolution across 30-day slicing windows to detect syndicate expansion.",
        "input": "Window 1 (T-60d): 6 active nodes, ₹45 Lakh volume. Window 2 (T-30d): 11 active nodes, ₹1.2 Crore volume. Window 3 (Current): 18 active nodes, ₹5.28 Crore volume.",
        "output": "TEMPORAL NETWORK INTELLIGENCE DOSSIER:\n\n1. Volume Velocity Shift: +1073.3% exponential expansion over 60 days.\n2. Structural Expansion: Rapid onboarding of 12 new peripheral mule accounts across Western corridor.\n3. Emerging Hubs: Entity Dinesh Kulkarni transitioned from leaf node (Degree 1 in W1) to primary logistics broker (Degree 6 in W3).\n4. Threat Level: Syndicate is in hyper-scaling phase prior to anticipated capital flight. Immediate interception required before offshore dispersal completes."
    },
    {
        "instruction": "Interpret communication frequency surges preceding physical contraband transit.",
        "input": "Cell Tower: NH-48 Toll Corridor (Pune Bypass). Communication baseline: 2 calls/week. Surge Window: 42 calls in 3 hours between 01:00 AM and 04:00 AM.",
        "output": "TEMPORAL BURST SURVEILLANCE REPORT:\n\n1. Anomaly Signature: Nocturnal telecommunication burst (+2000% over baseline).\n2. Spatial Convergence: Simultaneous triangulation of convoy vehicles MH-01-EA-9021 and MH-12-PQ-7788 along NH-48 toll plaza.\n3. Modus Operandi: Pilot vehicle scout communicating weighbridge bypass clearance to trailing freight carrier.\n4. Operational Action: Dispatch intercept squadron to Pune-Bengaluru bypass toll cordon."
    },

    # --- Category 5: Multi-Signal Entity Resolution ---
    {
        "instruction": "Resolve whether suspect query 'Vickram Rathour' matches canonical syndicate kingpin 'Vikram Rathore'.",
        "input": "Target: 'Vickram Rathour' (Phone: +919860652380, City: Mumbai). Canonical Record: 'Vikram Rathore' (Entity ID: P-0001, Phone: 09860652380, City: Mumbai).",
        "output": "MULTI-SIGNAL ENTITY RESOLUTION DOSSIER:\n\n• Decision: HIGH CONFIDENCE CANONICAL MATCH (Score: 0.99)\n• Signal Breakdown:\n  1. Exact Identifier: 10-digit phone match (9860652380 == 9860652380) → Score: 1.0\n  2. Token Similarity: Levenshtein/Token ratio 0.91 → Score: 0.91\n  3. Phonetic Soundex: 'Vickram' (V265) == 'Vikram' (V265); 'Rathour' (R360) == 'Rathore' (R360) → Score: 1.0\n  4. Attribute Overlap: Shared jurisdiction 'Mumbai' → Score: 1.0\n• Conclusion: Target 'Vickram Rathour' is an orthographic variant of canonical kingpin Vikram Rathore (P-0001)."
    },
    {
        "instruction": "Resolve entity match when name has low string similarity but shares exact government tax identifier.",
        "input": "Target: 'M/S North Star Express Cargo' (PAN: AABCN1234F). Canonical Record: 'NorthStar Logistics Pvt Ltd' (Entity ID: O-0001, PAN: AABCN1234F).",
        "output": "MULTI-SIGNAL ENTITY RESOLUTION DOSSIER:\n\n• Decision: DEFINITIVE CANONICAL MATCH (Score: 0.99)\n• Signal Breakdown:\n  1. Exact Tax ID: PAN AABCN1234F identical across both corporate entities.\n  2. Nominal Token Similarity: 0.58 (Discrepancy due to DBA / trade style variation).\n  3. Corporate Registry Reconciliation: MCA21 cross-check confirms North Star Express Cargo operates as an unregistered division of NorthStar Logistics Pvt Ltd.\n• Conclusion: Unify records under canonical Master Entity O-0001."
    },

    # --- Category 6: Link Prediction & Covert Ties ---
    {
        "instruction": "Explain how Link Prediction identifies covert co-conspirators who never directly communicate.",
        "input": "Suspects X and Y have zero direct CDR calls or bank transfers, but share 4 common mutual contacts (Vikram Rathore, NorthStar Logistics, Dinesh Kulkarni, Sunil Verma).",
        "output": "EXPLAINABLE LINK PREDICTION BRIEFING:\n\n1. Topological Mechanism: High Triadic Closure Probability.\n2. Adamic-Adar Index: Highly weighted because shared intermediaries are specialized criminal brokers rather than high-degree random nodes.\n3. Jaccard Neighborhood Coefficient: 0.57 (High structural equivalence).\n4. Criminal Implication: In compartmentalized syndicates, cell leaders avoid direct bilateral contact to evade mutual wiretap discovery, relying on trusted common brokers to relay instructions and capital.\n5. Recommendation: Monitor intermediary bridging channels for synchronized relay handshakes."
    },
    {
        "instruction": "Evaluate predicted covert edge between Dinesh Kulkarni and Dubai Bullion Liquidator Rashid Al-Mansoor.",
        "input": "Link Prediction Algorithm: Ensemble (Adamic-Adar + Jaccard + Common Neighbors). Score: 0.892. Shared intermediaries: Vikram Rathore, NorthStar Logistics.",
        "output": "PREDICTIVE LINK INTELLIGENCE REPORT:\n\n• Predicted Link: Dinesh Kulkarni (P-0007) ↔ Rashid Al-Mansoor (P-0004)\n• Prediction Confidence: 89.2% (Very High)\n• Algorithm: Ensemble Topological Bridging\n• Evidentiary Topology: Both entities share strong dual bridging ties through ringleader Vikram Rathore (P-0001) and corporate vehicle NorthStar Logistics (O-0001).\n• Investigative Recommendation: Issue preemptive Lookout Circular (LOC) against Dinesh Kulkarni and subpoena cross-border transit manifests."
    }
]

NEW_VAL_SAMPLES = [
    {
        "instruction": "Verify the digital certificate requirements under Section 63 BSA 2023 for seized financial spreadsheets.",
        "input": "Document: Excel workbook Hawala_Settlement_Q4.xlsx seized from laptop (SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069).",
        "output": "SECTION 63 BSA 2023 VERIFICATION:\n• Certificate must be executed by officer in charge of computer terminal.\n• Document must maintain valid cryptographic SHA-256 hash match.\n• Ordinary course of business storage must be sworn under schedule certificate."
    },
    {
        "instruction": "Assess flight risk and statutory priority for Case CR-2026-00124 (Operation Nightfall).",
        "input": "Lead Target: Vikram Rathore. Tracked volume: ₹5.28 Crore. Impending statutory timeline: 18 days remaining under Section 187 BNSS.",
        "output": "OPERATIONAL PRIORITY ASSESSMENT:\n• Priority: Critical #1\n• Urgency: 18 days remaining to submit chargesheet to avoid default bail under Section 187 BNSS.\n• Cross-border Risk: Dubai DMCC bullion liquidation requires immediate provisional freeze under PMLA Section 5."
    },
    {
        "instruction": "Predict hidden conduit between front shell corporate entities.",
        "input": "Entities: Apex Factoring (O-0005) and NorthStar Logistics (O-0001). Shared directorship: Vikram Rathore.",
        "output": "PREDICTED CONCEALED NEXUS:\n• Topological Link Confidence: 94.5%\n• Modus Operandi: Shared common controller indicates circular billing and Hawala factoring round-trip conduit."
    }
]

def main():
    # Read existing
    with open(TRAIN_FILE, "r", encoding="utf-8") as f:
        existing_train = [json.loads(line) for line in f if line.strip()]

    with open(VAL_FILE, "r", encoding="utf-8") as f:
        existing_val = [json.loads(line) for line in f if line.strip()]

    print(f"Existing train samples: {len(existing_train)}")
    print(f"Existing val samples: {len(existing_val)}")

    # Append new domain-specific samples
    with open(TRAIN_FILE, "a", encoding="utf-8") as f:
        for s in NEW_TRAIN_SAMPLES:
            f.write(json.dumps(s) + "\n")

    with open(VAL_FILE, "a", encoding="utf-8") as f:
        for s in NEW_VAL_SAMPLES:
            f.write(json.dumps(s) + "\n")

    total_train = len(existing_train) + len(NEW_TRAIN_SAMPLES)
    total_val = len(existing_val) + len(NEW_VAL_SAMPLES)

    print(f"Successfully expanded dataset!")
    print(f"Total train samples: {total_train}")
    print(f"Total val samples: {total_val}")
    print(f"Total samples: {total_train + total_val}")

if __name__ == "__main__":
    main()
