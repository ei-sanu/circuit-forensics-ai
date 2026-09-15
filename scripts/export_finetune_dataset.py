"""CIRCUIT 2.0 — Automated Fine-Tuning Dataset Generator & Exporter.
Extracts structured intelligence, FIR documents, Hawala transactions, CDR graphs,
and anomaly detection rules into standard instruction-tuning JSONL formats.
"""
import os
import re
import json
import random
from typing import List, Dict, Any

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Forensic Template Definitions
ANOMALY_TEMPLATES = [
    {
        "instruction": "Analyze the financial transactions for the target account and determine if any anti-money laundering or Hawala anomaly signatures are present.",
        "input": "Account: {account}\nTransactions Inflow: {inflow}\nTransactions Outflow: {outflow}\nTemporal Window: {window}\nBeneficiary Entities: {beneficiaries}",
        "output": "ANOMALY DETECTION REPORT:\n• Classification: {pattern}\n• Severity: {severity}\n• Forensic Finding: {finding}\n• Applicable Regulatory Statute: {statute}\n• Recommended Investigative Action: {action}"
    },
    {
        "instruction": "Evaluate the Call Detail Records (CDR) and identify covert telecommunication patterns.",
        "input": "Caller: {caller}\nRecipient: {recipient}\nTimestamps: {timestamps}\nCell Tower IDs: {towers}\nDuration Summary: {duration}",
        "output": "TELECOM INTELLIGENCE ASSESSMENT:\n• Pattern: {pattern}\n• Circadian Window: {window}\n• Tactical Risk: {risk}\n• Analysis: {analysis}\n• Recommended Surveillance Action: {action}"
    },
    {
        "instruction": "Perform bilingual Named Entity Recognition (NER) and statutory extraction on the First Information Report (FIR).",
        "input": "FIR Document Text:\n\"\"\"{fir_text}\"\"\"",
        "output": "{json_extraction}"
    },
    {
        "instruction": "Explain the role and structural influence of the entity within the criminal syndicate network.",
        "input": "Entity: {entity_name} ({entity_id})\nAliases: {aliases}\nCase Association: {cases}\nConnected Nodes: {connections}\nGraph Centrality: {centrality}",
        "output": "SYNDICATE EGO-NETWORK DOSSIER:\n• Entity: {entity_name}\n• Operational Role: {role}\n• Centrality & Broker Status: {centrality_desc}\n• Key Co-conspirators: {co_conspirators}\n• Prosecution Strategy: {strategy}"
    }
]

# 2. Master Curated Training Samples from CIRCUIT Core Dataset
CURATED_SAMPLES = [
    {
        "instruction": "Analyze the financial transaction chain and identify any anti-money laundering anomaly signatures.",
        "input": "Account: ACC-918237 (Rajesh Verma)\nTransactions: Received ₹48,500 from ACC-102938 and ₹49,000 from ACC-771239 within 4 hours; immediately transferred ₹95,000 to ACC-441029 (Apex Factoring LLC).\nDispersal Window: < 24 hours.",
        "output": "CRITICAL ANOMALY DETECTED: Structuring / Smurfing with Pass-Through Mule Dispersal.\n\n1. Structuring (PAN Evasion): Repetitive transfers placed just under the ₹50,000 statutory reporting threshold under Section 139A of the Income Tax Act.\n2. Pass-Through Routing: 97.4% fund dispersal within 4 hours to beneficiary ACC-441029 indicates layering through a conduit mule account.\n3. Recommendation: Freeze beneficiary account under PMLA Section 17 and request KYC audit on originating accounts."
    },
    {
        "instruction": "Perform bilingual Named Entity Recognition (NER) and statutory extraction on the First Information Report (FIR).",
        "input": "FIR Document Text:\n\"\"\"FIR No. 124/2026 registered at Colaba Cyber Crime PS, Mumbai. Complainant Manoj Singhal reported illicit diversion of ₹1.48 Crore through shell entities. Primary suspect Rajesh Verma alias 'RV' (PAN: ABCPV9182K, Mobile: +91 98201 44891) driving vehicle MH-01-DE-5678 coordinated Hawala cash handshakes u/s IPC 420, 120B, 406 and Section 318 Bharatiya Nyaya Sanhita (BNS).\"\"\"",
        "output": json.dumps({
            "fir_number": "124/2026",
            "police_station": "Colaba Cyber Crime PS, Mumbai",
            "complainant": "Manoj Singhal",
            "amount_inr": 14800000,
            "suspects": [{"name": "Rajesh Verma", "aliases": ["RV"], "pan": "ABCPV9182K", "phone": "+919820144891", "vehicle": "MH01DE5678"}],
            "statutes": ["IPC 420", "IPC 120B", "IPC 406", "BNS 318"],
            "offense_type": "Hawala Diversion & Cheating",
            "syndicate_role": "Hawala Logistics Coordinator"
        }, indent=2)
    },
    {
        "instruction": "Evaluate the Call Detail Records (CDR) and identify covert telecommunication patterns.",
        "input": "Caller: +91 98201 44891 (RV)\nRecipient: +91 98111 22233 (Tariq Al-Mansoor)\nTimestamps: 2026-08-12 02:14:22 UTC, 2026-08-12 03:45:10 UTC, 2026-08-13 01:30:15 UTC\nCell Tower IDs: TOWER-MUM-400051-A, TOWER-DEL-110001-B\nDuration Summary: 184s, 310s, 95s (Average: 196s).",
        "output": "TELECOM INTELLIGENCE ASSESSMENT:\n• Pattern: Odd-Hour Nocturnal Interaction Surge.\n• Circadian Window: High-anomaly nocturnal window (01:00 - 04:00 AM UTC).\n• Tactical Risk: HIGH (Coordinated Logistical Synchronisation).\n• Analysis: Repetitive nocturnal voice calls between suspect in Mumbai South and cross-border associate in Delhi/Dubai corridor indicate live operational coordination during off-peak hours.\n• Recommendation: Issue Section 91 CrPC notice for subscriber verification and geofence cell towers MUM-400051 & DEL-110001."
    },
    {
        "instruction": "Identify the primary bottleneck node in the following syndicate graph and suggest a disruption strategy.",
        "input": "Syndicate: Operation Nightfall (CR-2026-00124)\nGraph Metrics: 52 Nodes, 148 Edges.\nArticulation Points: [P-0001: Rajesh Verma].\nBetweenness Centrality: Rajesh Verma (0.78), Tariq Al-Mansoor (0.64), Sunil Gounder (0.42).\nConnected Clusters: Mumbai Port Logistics (Cluster 1) <---> Dubai Factoring Vaults (Cluster 2).",
        "output": "SYNDICATE BOTTLENECK DISRUPTION ANALYSIS:\n• Key Bottleneck: Rajesh Verma (P-0001).\n• Graph Topology: Acts as the sole articulation bridge connecting domestic freight forwarders with international clearing houses.\n• Disruption Impact: Neutralizing or detaining Node P-0001 will increase network fragmentation by 86%, immediately isolating Cluster 1 from offshore liquidity channels in Cluster 2.\n• Prosecution Priority: Execute simultaneous freeze on P-0001's primary banking conduits before apprehending to prevent asset flight."
    },
    {
        "instruction": "Generate a Section 63 BSA / Section 65B Indian Evidence Act certification summary for digital transaction evidence.",
        "input": "Case: CR-2026-00124 (Operation Nightfall)\nSignatory Officer: Inspector Vikram Rao (Badge: MH-CID-8821)\nEvidence Ingested: 14 Bank CSV Ledgers, 8 Scanned FIRs, 42 Telecom CDR Records\nPrimary Document SHA-256: 8f9a2bc41d77a0e3c59128f6120e8b234190c1287e02bfa4081c7e2b34a19210",
        "output": "STATUTORY ELECTRONIC EVIDENCE CERTIFICATION:\n\n\"I, Inspector Vikram Rao (Badge: MH-CID-8821), Investigating Officer, State Cyber Crime Unit, hereby certify under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (formerly Section 65B of Indian Evidence Act, 1872) that the electronic records, relationship graphs, and financial ledgers for Case CR-2026-00124 were extracted using the CIRCUIT 2.0 Intelligence Platform during ordinary operational parameters.\n\n• Cryptographic Digest: SHA-256 (NIST FIPS 180-4)\n• Certificate ID: CIRCUIT-CERT-8F9A2BC41D77A0E3\n• Integrity Verification: Authentic and Unaltered.\""
    },
    {
        "instruction": "Analyze a Circular Hawala Loop detected across 4 bank accounts and explain the flow topology.",
        "input": "Transactions:\n1. ACC-101 (Shell Import Corp) -> ACC-202 (Karan Malhotra): ₹ 45,00,000 (RTGS)\n2. ACC-202 (Karan Malhotra) -> ACC-303 (Dubai Bullion Token): ₹ 44,20,000 (Trade Advance)\n3. ACC-303 (Dubai Bullion Token) -> ACC-404 (Al-Mansoor Logistics): ₹ 43,80,000 (Consulting)\n4. ACC-404 (Al-Mansoor Logistics) -> ACC-101 (Shell Import Corp): ₹ 43,00,000 (Invoice Settlement)",
        "output": "CIRCULAR HAWALA FLOW FORENSIC SUMMARY:\n• Cycle Length: 4 Nodes (ACC-101 -> ACC-202 -> ACC-303 -> ACC-404 -> ACC-101).\n• Retention Decay: ₹ 2,00,000 (4.4% network fee retained by intermediaries).\n• Typology: Closed-Loop Round-Tripping.\n• Purpose: Simulating legitimate commercial activity and fictitious invoicing to repatriate untaxed illicit capital back to the original shell entity.\n• Evidence Flag: High risk under PMLA Section 3 (Offence of Money-Laundering)."
    }
]

def generate_synthetic_finetune_data(count: int = 150) -> List[Dict[str, Any]]:
    """Generate diverse domain-adapted criminal intelligence samples."""
    samples = list(CURATED_SAMPLES)
    
    indian_cities = ["Mumbai", "Delhi", "Bengaluru", "Kolkata", "Ahmedabad", "Pune", "Hyderabad", "Lucknow", "Jaipur", "Chandigarh"]
    suspect_names = ["Vikram Rathore", "Karan Singhania", "Sunil Gounder", "Rashid Al-Mansoor", "Rajesh Verma", "Amit Deshmukh", "Sameer Khan", "Harpreet Gill"]
    aliases = ["RV", "Cargo Raja", "Bhaiya", "Doctor", "Hawala King", "Captain", "Cash Baba", "Shadow"]
    statutes_pool = ["IPC 420", "IPC 120B", "IPC 468", "IPC 471", "BNS 318", "BNS 61", "PMLA Sec 3", "NDPS Sec 21", "Arms Act 25"]
    
    for i in range(count):
        s_name = random.choice(suspect_names)
        alias = random.choice(aliases)
        city = random.choice(indian_cities)
        amt = random.randint(20, 95) * 1000
        total_cr = round(random.uniform(0.5, 4.5), 2)
        station = f"{city} Cyber Crime Police Station"
        statute_choice = random.sample(statutes_pool, k=random.randint(2, 4))
        
        sample_type = i % 4
        if sample_type == 0:
            # Smurfing & Structuring
            samples.append({
                "instruction": "Analyze the financial transaction chain and identify any anti-money laundering anomaly signatures.",
                "input": f"Account: ACC-{random.randint(100000, 999999)} ({s_name})\nTransactions: Repetitive deposits of ₹{amt:,} and ₹{amt - 1500:,} aggregating to ₹{total_cr} Crore received from 4 distinct accounts in {city} within 12 hours.",
                "output": f"CRITICAL ANOMALY DETECTED: Structuring / Smurfing Pattern.\n\n1. Sub-Threshold Evasion: Multiple transfers placed below the statutory ₹50,000 PAN threshold to evade automated CTR filing.\n2. Aggregate Turnover: ₹{total_cr} Crore laundered through distributed micro-deposits in {city}.\n3. Relevant Law: PMLA Section 3 and Income Tax Act Section 139A.\n4. Action: Initiate immediate SAR (Suspicious Activity Report) filing and alert FIU-IND."
            })
        elif sample_type == 1:
            # FIR Extraction
            fir_no = f"{random.randint(10, 450)}/2026"
            pan = f"{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}P{chr(random.randint(65, 90))}{random.randint(1000, 9999)}{chr(random.randint(65, 90))}"
            phone = f"+9198{random.randint(10000000, 99999999)}"
            samples.append({
                "instruction": "Perform bilingual Named Entity Recognition (NER) and statutory extraction on the First Information Report (FIR).",
                "input": f"FIR No. {fir_no} filed at {station}. Accused {s_name} (Alias: '{alias}', PAN: {pan}, Mobile: {phone}) booked for diverting commercial factoring funds under {', '.join(statute_choice)}.",
                "output": json.dumps({
                    "fir_number": fir_no,
                    "police_station": station,
                    "suspects": [{"name": s_name, "alias": alias, "pan": pan, "phone": phone}],
                    "statutes": statute_choice,
                    "total_value_cr": total_cr,
                    "jurisdiction": city
                }, indent=2)
            })
        elif sample_type == 2:
            # CDR Nocturnal Surveillance
            phone1 = f"+9198{random.randint(10000000, 99999999)}"
            phone2 = f"+9199{random.randint(10000000, 99999999)}"
            tower = f"TOWER-{city.upper()[:3]}-{random.randint(1000, 9999)}"
            samples.append({
                "instruction": "Evaluate the Call Detail Records (CDR) and identify covert telecommunication patterns.",
                "input": f"Target: {s_name} ({phone1})\nContact: {phone2}\nLocation: {tower}\nCall Timings: 02:15 AM, 03:30 AM, 04:10 AM (Total duration: {random.randint(400, 1200)} seconds).",
                "output": f"TELECOM SURVEILLANCE REPORT:\n• Anomaly: Nocturnal Intercept Spike ({city} Sector).\n• Risk Level: High.\n• Intelligence Analysis: Concentrated nocturnal communication recorded via Cell Tower {tower} indicates active logistical handshake before scheduled illicit transit.\n• Action: Deploy mobile surveillance unit and cross-reference tower dump data."
            })
        else:
            # Copilot Syndicate QA
            case_id = f"CR-2026-{random.randint(100, 899):05d}"
            samples.append({
                "instruction": "Analyze the suspect's role in the active criminal network.",
                "input": f"Case: {case_id}\nSuspect: {s_name} (Alias: {alias})\nKnown Hops: 5 Bank Accounts, 2 Cloned Vehicles, 1 Transit Port in {city}.",
                "output": f"SYNDICATE ROLE PROFILE ({case_id}):\n• Suspect: {s_name} ('{alias}')\n• Functional Role: Layering Manager & Transport Coordinator in {city}.\n• Graph Position: High betweenness broker connecting ground mules to master account holders.\n• Legal Exposure: Subject to prosecution under {', '.join(statute_choice)}."
            })

    return samples

def export_all():
    print(f"[*] Extracting CIRCUIT 2.0 Fine-Tuning Datasets...")
    samples = generate_synthetic_finetune_data(200)
    
    # 1. Alpaca Format (Instruction, Input, Output)
    alpaca_file = os.path.join(OUTPUT_DIR, "circuit_finetune_alpaca.jsonl")
    with open(alpaca_file, "w", encoding="utf-8") as f:
        for s in samples:
            f.write(json.dumps(s) + "\n")
    print(f"[+] Exported Alpaca Format: {alpaca_file} ({len(samples)} samples)")

    # 2. Llama-3.1 Chat Format
    llama3_file = os.path.join(OUTPUT_DIR, "circuit_finetune_llama3.jsonl")
    with open(llama3_file, "w", encoding="utf-8") as f:
        for s in samples:
            item = {
                "messages": [
                    {"role": "system", "content": "You are CIRCUIT AI, an expert criminal intelligence and financial forensic analysis engine for law enforcement."},
                    {"role": "user", "content": f"{s['instruction']}\n\nContext:\n{s['input']}"},
                    {"role": "assistant", "content": s["output"]}
                ]
            }
            f.write(json.dumps(item) + "\n")
    print(f"[+] Exported Llama-3.1 Chat Format: {llama3_file} ({len(samples)} samples)")

    # 3. Train / Validation Split (85% / 15%)
    random.seed(42)
    shuffled = list(samples)
    random.shuffle(shuffled)
    split_idx = int(len(shuffled) * 0.85)
    train_data = shuffled[:split_idx]
    val_data = shuffled[split_idx:]

    train_file = os.path.join(OUTPUT_DIR, "train.jsonl")
    val_file = os.path.join(OUTPUT_DIR, "val.jsonl")
    with open(train_file, "w", encoding="utf-8") as f:
        for s in train_data:
            f.write(json.dumps(s) + "\n")
    with open(val_file, "w", encoding="utf-8") as f:
        for s in val_data:
            f.write(json.dumps(s) + "\n")

    print(f"[+] Train Dataset: {train_file} ({len(train_data)} samples)")
    print(f"[+] Validation Dataset: {val_file} ({len(val_data)} samples)")
    print("[*] Dataset generation complete!")

if __name__ == "__main__":
    export_all()
