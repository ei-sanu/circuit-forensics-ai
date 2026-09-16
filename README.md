# CIRCUIT — Criminal Intelligence & Relationship Investigation using Connected-Entity Tracking

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.18-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase%20Cloud-336791.svg?style=flat&logo=postgresql)](https://supabase.com/)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.0+-blue.svg?style=flat)](https://networkx.org/)
[![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.30.0-orange.svg?style=flat)](https://js.cytoscape.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED.svg?style=flat&logo=docker)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=flat)](#)

**CIRCUIT** is an enterprise-grade AI-powered Criminal Intelligence, Biometric Security, and Network Investigation Platform designed for law enforcement agencies, cybercrime divisions, and intelligence analysts. It ingests evidential documents (FIRs, financial statements, call detail records), extracts entities and relationships via NLP, builds interactive real-time knowledge graphs, and surfaces critical anomalies (pass-through accounts, circular fund routing, rapid transfer chains, and odd-hour communications).

---

## 🏛️ System Architecture

```text
                                  ┌───────────────────────────────┐
                                  │   Next.js 14 Web Frontend     │
                                  │   (Port 8080 / Port 3000)     │
                                  │   - Executive Terminal Theme  │
                                  │   - Interactive Cytoscape     │
                                  │   - Direct Face Biometrics    │
                                  │   - Geospatial OSM Map        │
                                  │   - Case Workspaces & Copilot │
                                  └───────────────┬───────────────┘
                                                  │
                                                  │ HTTP / REST / JWT Bearer
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │    CIRCUIT Core API           │
                                  │    (Python FastAPI : 3000)    │
                                  │    - 5-Role RBAC & JWT        │
                                  │    - AES-256-GCM 2FA Vault    │
                                  │    - Case & Entity Registry   │
                                  │    - Evidential AI Processing │
                                  │    - DNS Legal Framework      │
                                  │    - Anomaly Alert Dispatch   │
                                  │    - Compliance Audit Logging │
                                  └───────┬───────────────┬───────┘
                                          │               │
                     Internal HTTP / JSON │               │ SQLAlchemy Asyncpg (TLS 1.3)
                                          ▼               ▼
         ┌──────────────────────────────────┐   ┌──────────────────────────────┐
         │     Python ML / AI Engine        │   │     Supabase PostgreSQL      │
         │     (FastAPI : Port 8001)        │   │     (Port 5432 / 6543)       │
         │     - Spacy & NER Extraction     │   │   - Relational Tables        │
         │     - Entity Resolution Model    │   │   - Encrypted Biometrics     │
         │     - NetworkX Graph Analytics   │   │   - Audit Trail & FIRs       │
         │     - 10 Anomaly Detectors       │   │   - High-Speed Pooled SSL    │
         │     - 128D Face Biometrics       │   └──────────────────────────────┘
         └──────────────────────────────────┘
```

---

## ⚡ Core Capabilities & Innovations

### 1. 👁️ Hands-Free Direct Facial Biometric 2FA (Zero-Click Login)
* **Instant Optical Scan**: Fully automated hands-free biometric terminal workflow. No manual capture buttons or awkward blink challenges required.
* **Rolling Quality Buffer (`BestFrameBuffer`)**: Continuously tracks and buffers candidate frames across the last 8 ticks, ranking them for optical sharpness, luminance balance, and frontal face alignment.
* **Spatial Stability Tracker (`BiometricStabilityTracker`)**: Enforces a continuous ~500ms stabilization window (velocity drift $< 0.08$, centering tolerance $\le 0.12$).
* **Dynamic HUD Real-Time Countdown**: Visual real-time indicator (`[ ⏱️ HOLD STILL: 0.5s ]`) paired with an emerald radial scan ring and directional cue feedback pills.
* **AES-256-GCM Authenticated Encryption**: 128-D L2-normalized biometric vectors are encrypted using 256-bit keys derived via SHA-256 with 16-byte random IVs and 16-byte GCM authentication tags (`ivHex:authTagHex:ciphertextHex`).
* **Zero Raw Biometric Persistence**: Unencrypted facial embeddings or raw photos are never persisted to disk or database.

### 2. ⚖️ Modernized Bharatiya Nyaya Sanhita (DNS) Legal Framework
Modernized from legacy IPC codes to official **Bharatiya Nyaya Sanhita (DNS)** statutory sections across all investigation workflows, FIR tracking registries, and police station portals:
* **DNS 318**: Cheating & Financial Fraud (Replaces IPC 420)
* **DNS 61**: Criminal Conspiracy (Replaces IPC 120B)
* **DNS 338**: Forgery & Document Tampering (Replaces IPC 468)
* **DNS 319**: Cheating by Impersonation (Replaces IPC 419)
* **Section 66D IT Act**: Computer-Related Identity Fraud

### 3. 🕸️ Cytoscape.js Interactive Knowledge Graph
* **Multi-Layout Physics Simulations**: Dynamic switching between `COSE`, `Cola`, `Concentric`, `Circle`, `Breadthfirst`, and `Grid` graph layouts with collision avoidance.
* **Evidentiary Connection Wireframes**:
  * 🟡 **Financial Transfers** (`transferred_money_to`): Amber `#f59e0b`
  * 🟢 **Telecommunications** (`communicated_with`, `called`): Emerald `#10b981`
  * 🔵 **Syndicate Links** (`associated_with`): Sky `#0284c7`
  * 🟣 **Corporate Roles** (`employed_by`, `director_of`): Purple `#a855f7`
  * 🟠 **Asset Ownership** (`owns`, `drives_vehicle`): Orange `#f97316`
  * 🔴 **Geo Occurrences** (`visited`, `attended`): Rose `#ec4899`
* **1-Click High-Res PNG Dossier Export**: Instant "Save Image" snapshot tool producing crisp canvas graphics for evidence logs and court filings.
* **1-Click Theme Switcher**: Toggle seamlessly between **Cyber Dark Matrix** and **Executive White Wireframe** canvas modes.
* **NetworkX Algorithmic Engine**: Real-time graph computation for Betweenness Centrality, Degree Centrality, PageRank, Shortest Investigative Paths, and Community Louvain Clustering.

### 4. 🚨 10-Pattern Anomaly & Fraud Detection Engine
* **Circular Fund Routing**: Detects closed-loop money laundering transactions designed to obscure origin.
* **Rapid Pass-Through Mule Accounts**: Flags accounts receiving and dispersing funds within minutes.
* **Structuring / Smurfing**: Identifies recurring transactions kept just beneath regulatory thresholds.
* **Off-Hours Surges**: Highlights abnormal spikes in communication or banking between 11:00 PM and 5:00 AM.
* **Velocity Bursts & Cross-Case Linkages**: Automatically uncovers suspects and assets shared across multiple active FIRs.

### 5. 📂 Document AI & Human-in-the-Loop Evidential Processing
* **Automated Ingestion**: Upload PDF, TXT, or CSV records to extract persons, organizations, phone numbers, bank accounts, and vehicles via NER.
* **Entity Resolution**: Fuzzy similarity matching against canonical profiles to prevent duplicate records.
* **Human-in-the-Loop Review**: Mandatory investigator verification queue allowing analysts to approve, edit, or reject proposed entities and edges before committing to PostgreSQL.

### 6. 🛡️ Enterprise RBAC & Centralized HR Provisioning
* **5 Granular Roles**: `admin`, `investigator`, `analyst`, `police_station`, `hr`.
* **Centralized Provisioning**: Public self-registration is disabled. All accounts and biometric credentials are authenticated and issued by the HR Directorate or System Administrator.
* **Immutable Compliance Audit Trail**: Cryptographic logging of every query, mutation, export, and authentication attempt.

### 7. 🧠 Sovereign AI Investigative Researcher & Service-Level RAG
* **Zero Cloud Dependency & Sovereign Execution**: Sensitive criminal records, FIRs, and bank ledgers remain strictly on-premise on your local machine or intranet. Eliminates reliance on external paid APIs or third-party cloud services.
* **Tripartite Evidentiary Framework**:
  * **Verified Evidence**: Direct, empirical facts extracted from seized FIRs, MCA21 registries, and verified bank statements.
  * **Analytical Inference**: Rigorous algorithmic interpretations (Brandes betweenness centrality, PageRank, Louvain community clustering, Isolation Forest anomaly detection) framed in objective, non-accusatory language. Structural centrality indicates connectivity in available records, not criminal guilt.
  * **Potential Connections (`UNVERIFIED — HYPOTHESIS FOR INVESTIGATION`)**: Algorithmic hypotheses generated via Adamic-Adar, Jaccard similarity, and common-neighbor graph topology, prominently tagged with similarity percentage scores and shared intermediaries.
* **Real-Time Research Trace**: Every response provides an auditable execution trace detailing the exact analytical tools run (`graph_centrality`, `link_prediction`, `anomaly_detection`, `evidence_search`, `statutory_compliance`) and entities evaluated.
* **Transparent Explainability ("How did CIRCUIT reach this conclusion?")**: Dedicated chain-of-custody accordion exposing the Data Examined, Analysis Conducted, Evidence Reviewed, Key Finding, and Explicit Limitations.
* **Explicit Uncertainty & Evidentiary Boundaries**: Every major briefing defines "What remains unverified" to ensure analysts and courts understand the boundaries of algorithmic observations under Bharatiya Sakshya Adhiniyam (BSA 2023).
* **Service-Level FAISS Vector Store**: In-memory and disk-persisted (`rag_cache/global.faiss`) semantic retrieval using `all-MiniLM-L6-v2` embeddings over canonical case records and FIRs.
* **Sovereign Neural Intelligence Core (`circuit-sovereign-v2`)**: In-process neural intelligence engine with specialized forensic instructions for BNS 2023, BNSS 2023, and BSA 2023 Section 63 digital evidence admissibility. Operates 100% locally and offline without external daemons.
* **Local Fine-Tuning Engine**: Standalone LoRA training pipeline (`scripts/train_local.py`) compatible with Apple Silicon Metal (MPS), NVIDIA CUDA, or CPU using domain-specific dataset `data/train.jsonl`.

---

## 🔌 Microservice Components & Ports

| Component | Technology | Responsibility | Port / URL | API Documentation |
|---|---|---|---|---|
| **Frontend UI** | Next.js 14 (App Router) | Interactive Visualizer, Case Management, Direct Face Biometrics | `http://localhost:8080` | — |
| **Core API Gateway** | Python FastAPI + SQLAlchemy | Business logic, RBAC, Biometrics, Data Access, DNS FIRs | `http://localhost:3000` | `http://localhost:3000/docs`<br/>`http://localhost:3000/api/docs` |
| **AI / ML Engine** | Python FastAPI + NetworkX | NLP, Entity Resolution, Graph Centrality, 10 Anomaly Detectors | `http://localhost:8001` | `http://localhost:8001/docs` |
| **Database** | Supabase PostgreSQL | Persistent relational storage & encrypted biometric identity vault | `postgresql://...:5432` | — |
| **Reverse Proxy** *(Docker)* | Nginx Alpine | Unified ingress routing `/api/`, `/firs/`, `/ml/`, `/` | `http://localhost:80` | — |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14.2 (App Router), React 18, TypeScript 5.7, Tailwind CSS (Monochrome Dark/White), Cytoscape.js 3.30, Lucide React, Recharts, Leaflet |
| **Backend API** | Python 3.10+ / 3.12+, FastAPI 0.115, SQLAlchemy (Asyncpg), Pydantic v2, PyJWT, Cryptography (AES-256-GCM), Uvicorn |
| **AI & Graph Engine** | NetworkX 3.0+, Scikit-learn, SpaCy, 128-D FaceNet Biometric Embeddings, NumPy |
| **Database** | Supabase PostgreSQL Cloud Cluster (TLS 1.3, Connection Pooling, Relational Schemas) |
| **DevOps & Containers** | Docker, Docker Compose, Nginx Alpine, Multi-stage builds |

---

## 💻 Local Development Quickstart

### Prerequisites
* **Node.js**: v18.0+ or v20.0+ (`node --version`)
* **npm**: v9.0+ (`npm --version`)
* **Python**: v3.10, v3.11, v3.12, v3.13, or v3.14 (`python3 --version`)
* **Database**: Supabase PostgreSQL connection URI or local PostgreSQL

### Step 1: 1-Click Dependency Installation
```bash
npm run setup
```
*(Automatically installs frontend packages, Python server requirements, and configures the ML virtual environment across macOS, Linux, and Windows).*

### Step 2: Configure Environment Variables
Copy and configure the environment files:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

Ensure your `server/.env` contains your Supabase PostgreSQL credentials:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql+asyncpg://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=replace-with-a-32-byte-random-high-entropy-secret
BIOMETRIC_ENCRYPTION_KEY=replace-with-a-32-byte-hex-encryption-key
BIOMETRIC_ENABLED=true
CORS_ORIGIN=http://localhost:8080,http://localhost:3000
```

### Step 3: Run All Services Concurrently
```bash
npm run dev:all
```

Or run individual microservices in dedicated terminal tabs:
```bash
# Terminal 1: Core FastAPI Backend (Port 3000)
npm run server

# Terminal 2: ML / AI Engine (Port 8001)
npm run ml

# Terminal 3: Next.js Frontend (Port 8080)
npm run dev
```

### Step 4: Configure Local AI Model & Service-Level RAG
CIRCUIT 2.0 does not require external paid APIs or unstable cloud GPU notebooks (Google Colab). It runs 100% locally with high performance:

# Inspect active sovereign neural model status
npm run model:status

# Verify local FAISS document vector store status
curl -s http://localhost:3000/api/copilot/rag/status -H "Authorization: Bearer <token>"
```

*(Optional) Run standalone LoRA fine-tuning on your local hardware:*
```bash
# Trains directly on Apple Silicon Metal (MPS), NVIDIA CUDA, or multi-core CPU
npm run train:local
```

---

## 🐳 Docker Deployment

CIRCUIT provides containerized multi-stage Docker builds for rapid deployment.

### Option A: Production Multi-Container Stack
```bash
docker compose up -d --build
```
* **Frontend Application**: `http://localhost:8080` (or `http://localhost` via Nginx)
* **Core API Docs**: `http://localhost:3000/docs`
* **ML Engine Docs**: `http://localhost:8001/docs`
* **Healthcheck & DB Readiness**: `http://localhost:3000/health/ready`

To inspect container logs:
```bash
docker compose logs -f backend
```

To stop containers:
```bash
docker compose down
```

### Option B: Development Docker Stack (Hot Reloading)
```bash
docker compose -f docker-compose.dev.yml up
```

---

## 👥 Role Accounts & Enterprise Access Control

CIRCUIT implements 5 granular Role-Based Access Control (RBAC) tiers:

| Role | Default Identifier | Access & Authority Scope |
|---|---|---|
| **System Commander (Admin)** | `circuit@circuit.gov` | Primary administrator account with full platform control |
| **Administrator** | `admin@circuit.gov` | System configuration, user provisioning & immutable audit logs |
| **Senior Investigator** | `investigator@circuit.gov` | Case management, intelligence graph analysis & evidence review |
| **Intelligence Analyst** | `analyst@circuit.gov` | Financial loops, mule tracking & AI anomaly monitoring |
| **Police Station Lead** | `police@circuit.gov` | Station FIR filing, incident registry & live broadcast alerts |
| **HR Directorate** | `hr@circuit.gov` | Personnel onboarding & biometric credential issuance |

> [!IMPORTANT]
> **Production Credentials**: For local development and demonstration, initial credentials are set via the `SEED_DEFAULT_PASSWORD` environment variable (defaults to `demo123` in dev only). In production environments, all passwords must be provisioned securely via environment secrets, and multi-factor biometric verification must be enforced. No static fallback passwords or backdoors exist.

---

## 🧪 Automated Testing Suite

### 1. Core API Backend Tests (51 Test Cases Across 14 Modules)
```bash
npm run server:test
# or directly:
PYTHONPATH=server pytest server/tests/
```

### 2. Python ML / AI Engine Tests (13 Test Suites)
```bash
pytest services/ml-engine/tests/
```

### 3. Frontend TypeScript & Static Verification
```bash
npx tsc --noEmit --incremental false
```

---

## 📁 Project Directory Structure

```text
CIRCUIT/
├── app/                         # Next.js 14 App Router (Port 8080)
│   ├── dashboard/               # Executive dashboard & metrics overview
│   ├── explorer/                # Cytoscape Knowledge Graph Visualizer
│   ├── cases/                   # Active Case Files & Investigations
│   ├── entities/                # Entity Registry & Intelligence Profiles
│   ├── documents/               # Document Ingestion & Evidential AI Review
│   ├── alerts/                  # Anomaly Detection & Flagged Transactions
│   ├── copilot/                 # Natural Language Investigative Copilot
│   ├── police/                  # Police Station Portal & Incident Filing
│   ├── fir-track/               # DNS-compliant FIR Tracking System
│   ├── hr/                      # HR Personnel & User Provisioning
│   ├── locations/               # Geospatial Intelligence & Incident Maps
│   ├── transactions/            # Financial Ledger & Transfer Analysis
│   ├── communications/          # Telecommunications & Call Data Records
│   ├── reports/                 # Dossier Generation & Evidence Exports
│   ├── settings/                # Biometric 2FA Identity Vault Management
│   ├── login/                   # High-contrast Black/White Auth Terminal
│   └── page.tsx                 # Landing Page & Quick Modal Access
│
├── components/                  # UI Components, Biometric Modals, Leaflet Map, Shell
│   ├── auth/                    # BiometricVerification, FaceGuide, LivenessChallenge, AuthModal
│   ├── graph/                   # NetworkGraph (Cytoscape Force Visualizer & High-Res Export)
│   ├── landing/                 # LandingNavbar, Hero, Feature Showcase
│   └── shell/                   # AppShell, Sidebar, Topbar, StatusBadges
│
├── lib/                         # API Client, Auth helpers, Biometric Tracker, Utilities
│   ├── api.ts                   # Universal HTTP client & error handler
│   ├── auth.ts                  # Token management & session verification
│   └── biometric.ts             # BestFrameBuffer, StabilityTracker, 128D FaceNet
│
├── nginx/                       # Nginx Ingress Reverse Proxy Configuration
│   ├── nginx.conf
│   └── Dockerfile
│
├── scripts/                     # Cross-platform runners (Windows / macOS / Linux)
│   ├── dev-all.js               # Concurrent multi-service launcher
│   ├── install-all.js           # 1-click full stack installer
│   ├── install-ml.js            # Universal Python venv & pip installer
│   ├── run-ml.js                # Auto-detecting Python uvicorn ML launcher
│   └── run-server.js            # Auto-detecting Python uvicorn Server launcher
│
├── server/                      # CIRCUIT Core API Backend (FastAPI - Port 3000)
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/          # auth, biometric, cases, entities, documents,
│   │   │   │                    # graph, firs (DNS), alerts, copilot, audit, health
│   │   │   └── router.py        # Unified API router
│   │   ├── core/                # config, database (asyncpg), security, permissions
│   │   ├── integrations/        # ml_client (port 8001), s3_client (Cloudflare R2)
│   │   ├── schemas/             # Pydantic DTO validation schemas
│   │   ├── services/            # Business logic & Supabase database operations
│   │   ├── utils/               # biometric_crypto (AES-256-GCM)
│   │   └── main.py              # FastAPI application, CORS, lifespan startup
│   ├── tests/                   # Pytest suite (32 test cases)
│   ├── Dockerfile               # Production FastAPI container
│   ├── requirements.txt         # Python dependencies
│   └── README.md
│
├── services/
│   └── ml-engine/               # Python ML / AI Microservice (FastAPI - Port 8001)
│       ├── app/core/            # NER, Resolution, NetworkX Graph, 10 Anomaly Detectors
│       ├── app/api/             # /ml/extract, /ml/resolve, /ml/graph/*, /ml/detect-anomalies
│       ├── tests/               # Pytest suite (13 test cases)
│       ├── Dockerfile           # Production ML container
│       └── requirements.txt     # Python ML dependencies
│
├── docker-compose.yml           # Production Docker Compose orchestration
├── docker-compose.dev.yml       # Development Docker Compose orchestration
├── Dockerfile                   # Next.js multi-stage production Docker build
├── package.json                 # Frontend & Orchestration scripts
└── .env.example                 # Master environment variables template
```

---

## 🔒 Security & Compliance Specification

* **Zero Plaintext Credentials**: All sensitive tokens and biometric templates are encrypted at rest using AES-256-GCM.
* **Role-Based Access Control**: Strict route-level enforcement via FastAPI dependencies (`require_roles`).
* **Cryptographic Tamper-Proof Audit**: Every critical operation (document commit, biometric verification, case update, graph export) is logged with timestamp, user ID, client IP, and action metadata.

---

## 📄 License & Attribution

Developed for Enterprise Law Enforcement & Intelligence Agencies. All rights reserved.
