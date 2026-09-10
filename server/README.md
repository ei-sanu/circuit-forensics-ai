# CIRCUIT Core Backend (Python FastAPI + Supabase PostgreSQL)

The enterprise Core Backend and API Gateway for **CIRCUIT** (Criminal Intelligence & Relationship Investigation using Connected-Entity Tracking).

---

## 🏛️ Features

- **RBAC & Auth (`app.api.routes.auth`)**: JWT authentication, PBKDF2/Bcrypt password hashing, granular roles (`investigator`, `analyst`, `admin`, `police_station`, `hr`).
- **Biometric 2FA Vault (`app.api.routes.biometric`)**:
  - AES-256-GCM authenticated encryption (`ivHex:authTagHex:ciphertextHex`).
  - Face template enrollment, verification, direct optical scanning, and automated 128-D cosine similarity matching (0.85 threshold).
  - Zero-exposure biometric credential storage.
- **Case Management (`app.api.routes.cases`)**: Case workspaces, suspect linking, timelines, and priority tagging.
- **Entity Intelligence (`app.api.routes.entities`)**: Polymorphic intelligence registry (Persons, Organizations, Phones, Vehicles, Locations, Events) with fuzzy search.
- **Document AI & Evidential Processing (`app.api.routes.documents`)**:
  - Secure document ingestion with Cloudflare R2 / S3 storage and local fallback.
  - Automatic entity extraction and resolution delegation to the Python ML microservice (`http://localhost:8001/ml/*`).
  - Human-in-the-loop review and commit of approved entities/edges to PostgreSQL.
- **Graph Analytics Gateway (`app.api.routes.graph`)**: Extracts graph state from PostgreSQL, delegates NetworkX calculations to Python ML (`/ml/graph/*`), and serves Cytoscape-formatted payloads.
- **FIR & Incident Forensic Registry (`app.api.routes.firs`)**: Modernized Bharatiya Nyaya Sanhita (DNS) legal framework tracking (DNS 318, DNS 61, DNS 338, DNS 319, Sec 66D IT Act).
- **Anomaly Detection & Monitoring (`app.api.routes.alerts`)**: Monitors transactions, communications, and graph structures for circular flow, pass-through mules, and odd-hour surges.
- **Compliance Audit Trail (`app.api.routes.audit`)**: Immutable audit logging on all mutations.

---

## 🚀 Running the Server (Port 3000)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Ensure Supabase PostgreSQL or local PostgreSQL is running and check `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

- **API Base**: `http://localhost:3000`
- **Swagger / OpenAPI Documentation**: `http://localhost:3000/docs` (or `/api/docs`)
- **Healthcheck**: `http://localhost:3000/health` & `http://localhost:3000/health/ready`

---

## 🧪 Testing Suite

Run the full pytest suite with:
```bash
pytest tests/
```

---

## 🔒 Authentication & RBAC

The API Gateway enforces strict Role-Based Access Control via FastAPI dependency injection (`require_roles`, `get_current_user`) and JWT bearer tokens across 5 roles: `investigator`, `analyst`, `admin`, `police_station`, and `hr`.

Configure secrets in your local environment file (`server/.env`):
```bash
DATABASE_URL=postgresql+asyncpg://postgres.<ref>:<pass>@aws-0-<region>.pooler.supabase.com:6543/postgres
JWT_SECRET=your-secure-random-jwt-key
BIOMETRIC_ENCRYPTION_KEY=your-32-byte-biometric-encryption-key
ML_ENGINE_URL=http://localhost:8001
PORT=3000
```
