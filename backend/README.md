# ZeroBreach AI — Backend Service Architecture

The ZeroBreach AI backend is built on **FastAPI**, **Scapy**, **Scikit-learn**, **XGBoost**, and **MongoDB Motor** (async). It provides real-time network packet capture, dataset SSE streaming at 23,000+ flows/second, dual-model machine learning inference, and RESTful telemetry APIs.

---

## 1. Directory Structure

```
backend/
├── api/
│   ├── auth.py          # JWT authentication, role management, API keys
│   ├── dashboard.py     # Aggregated SOC metrics, 3D cylinder flow volume, SIEM export
│   ├── sniffer.py       # Live Scapy packet sniffer & High-speed SSE stream engine
│   └── tickets.py       # Incident ticketing, SOC workflow management
├── core/
│   ├── config.py        # Environment variables and application configuration
│   └── security.py      # Password hashing, JWT token generation & verification
├── ml/
│   ├── ensemble.py      # Dual-Model Ensemble (Random Forest + XGBoost) arbitrator
│   ├── preprocessor.py  # 81 NetFlow feature scaler and imputation
│   └── saved_models/    # Trained RF (.pkl) and XGBoost (.json) models
├── models/
│   ├── schemas.py       # Pydantic request/response validation schemas
│   └── mongo_models.py  # MongoDB document models
├── database.py          # MongoDB async client connection & collection handles
├── main.py              # FastAPI app initialization, middleware, CORS, routes
└── requirements.txt     # Python dependencies
```

---

## 2. Ingestion & Inference Pipelines

### High-Speed SSE Stream (`/api/sniffer/stream-dataset`)
- Reads CICIDS2017 CSVs (`monday.csv` through `friday.csv`) or user-uploaded CSVs in 10,000-flow chunks.
- Delivers **23,000+ flows/second** over Server-Sent Events (`text/event-stream`).
- Persists true run metrics directly into MongoDB `scan_sessions` while inserting a prioritized sample of 250 alert documents per chunk into `traffic_logs` to maintain zero-latency I/O.

### Live Hardware Sniffer (`/api/sniffer/start-live`, `/api/sniffer/stop-live`)
- Promiscuous packet capture using Scapy on local Wi-Fi or Ethernet interfaces.
- Extracts flow features via CICFlowMeter and classifies in real time.
- Implements bidirectional port suppression on QUIC / HTTP/3 (`UDP:443`), DNS (`53`, `853`), and NTP (`123`) to prevent false-positive `Portscan` alerts on normal Wi-Fi traffic.

### Dual-Model Ensemble
- **Champion**: Random Forest (100 Trees)
- **Challenger**: XGBoost (Gradient Boosted Trees)
- **Arbitration**: Winner-takes-maximum-confidence with disagreement logging.

---

## 3. Database Collections

- `traffic_logs`: Incident records with anomaly classification, confidence, source/destination IPs, ports, protocol, and risk scores.
- `scan_sessions`: Aggregate run telemetry (`total_scanned`, `total_anomalies`, `high_risk`, duration, threats breakdown, and protocol distribution).
- `users`: User credentials, hashed passwords, and RBAC roles (`admin`, `soc`, `analyst`, `enterprise`).
- `tickets`: Incident management tickets for SOC analysts.

---

## 4. Setup & Running

```bash
# 1. Activate Python virtual environment
venv\Scripts\activate

# 2. Install dependencies (if needed)
pip install -r requirements.txt

# 3. Start development server with reload
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI docs are available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
