# CrimeGraph ML Engine Microservice

Dedicated Python/FastAPI microservice providing:
1. **NER Extraction (`/ml/extract`)**: Rule-based + gazetteer NLP for Indian phone formats (+91), Indian vehicle registration plates, person names, organizations, monetary amounts, and dates.
2. **Entity Resolution (`/ml/resolve`)**: Fuzzy token overlap, alias matching, and Jaro-Winkler/Levenshtein matching against known entities.
3. **Graph Intelligence (`/ml/graph/*`)**: NetworkX-backed betweenness centrality, degree, PageRank, Louvain/modularity community detection, influence scoring (0–100), shortest evidential path, and node-removal simulation.
4. **Anomaly Detection (`/ml/detect-anomalies`)**: 10 explainable detectors including pass-through accounts, circular laundering loops, rapid transfer chains, and odd-hour call surges.
5. **AI Copilot (`/ml/copilot`)**: Fact-checked, citation-backed investigative query engine with support for local AI/Ollama.

---

## 🚀 Setup & Run

### 1. Install Dependencies
```bash
cd services/ml-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env` (pre-created for local dev):
```bash
cp .env.example .env
```

### 3. Run the Server
```bash
uvicorn app.main:app --port 8001 --reload
```

- **Interactive API Docs**: `http://localhost:8001/docs`
- **Health Check**: `http://localhost:8001/ml/health`

---

## 🔒 Security
All endpoints under `/ml/*` (except `/ml/health`) require the service-to-service header:
```http
X-Internal-Service-Key: dev-secret-internal-service-key-2026
```

---

## 🧪 Running Tests

```bash
pytest tests/ -v
```
