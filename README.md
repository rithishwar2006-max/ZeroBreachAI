# ZeroBreach AI — Enterprise Network Intrusion Detection & Telemetry Platform

ZeroBreach AI is an enterprise-grade Network Intrusion Detection & Threat Intelligence Platform (NIDS/NDR). It combines real-time hardware packet sniffing (Wi-Fi/Ethernet) and high-speed SSE dataset streaming with a Dual-Model Machine Learning Ensemble (Random Forest + XGBoost) and context-aware risk scoring.

---

## Key Features

- **Dual-Model Ensemble ML Engine**:
  - Primary Champion: Random Forest (100 Trees)
  - Secondary Challenger: XGBoost (Gradient Boosted Decision Trees)
  - Dynamic Confidence Arbitration: Winner takes max confidence with real-time disagreement auditing.
- **Unified Ingestion Pipelines (2 Modes)**:
  - **Live Hardware Capture**: Promiscuous packet sniffing off physical Wi-Fi/Ethernet interfaces via Scapy and CICFlowMeter (80+ statistical flow features).
  - **High-Speed SSE Dataset Stream**: Chunk-by-chunk Server-Sent Events streaming supporting all 5 days of CICIDS2017 (`monday.csv` to `friday.csv`) and custom uploaded CSVs at **23,000+ flows/second**.
- **Multi-Session Telemetry & Synchronization**:
  - Dedicated MongoDB `scan_sessions` collection tracking full aggregate telemetry (`total_scanned`, `total_anomalies`, `high_risk`, threat and protocol breakdowns).
  - Synchronized dashboard metrics: `#v1 Malicious flows detected` and `#v2 Anomalies today` stay in sync with live scan counts without down-scaling or conflict.
- **3D Isometric Frosted Glass Anomaly Pillars (Three.js WebGL)**:
  - Visualizes sessions with log-normalized height scaling, neon ground blooms, floating pill badges, and interactive raycasting.
  - Dedicated **`● LIVE CAPTURE`** pulsing emerald beacon for hardware sniffer captures, and clean dataset names for file streams.
- **Modern Protocol & False-Positive Handling**:
  - Bidirectional suppression (`sport` and `dport`) for **QUIC / HTTP/3 over UDP port 443**, DNS (`53`, `853`), and NTP (`123`).
  - **LAN & Port Diversity Filter**: Distinguishes true multi-port scan sweeps ($\ge 5$ distinct ports) from benign isolated single SYN flows across private subnets (RFC 1918) and Windows discovery/file sharing services (`135`, `139`, `445`, `5353`, `1900`, `3702`, `8008`, `62078`), preventing false `Portscan` alerts on normal Wi-Fi.
  - Verified **`monday.csv`** zero-anomaly baseline against the CICIDS2017 ground truth (100% Benign).
- **28-Channel Threat Frequency Spectrum & Holographic Protocol Radar**:
  - Real-time 28-channel spectral visualizer across 4 threat bands (Low Risk, Baseline, Suspicious, Critical).
  - 3D geodesic rotating globe mapping Layer 4 transport protocols (TCP, UDP, ICMP, HTTP/HTTPS).
- **Enterprise Governance & SOC Incident Response**:
  - Role-Based Access Control (RBAC) across 4 roles: `admin` (Security Lead), `soc` (Threat Hunter), `analyst` (Security Analyst), `enterprise` (Corporate Defender).
  - Automated SIEM streaming export (`/api/dashboard/export-siem`) and full-state disaster recovery snapshots (`/api/dashboard/backup`).
- **Run-Specific & Resilient AI SOC Assistant (`/api/dashboard/chat`)**:
  - Dynamically injected real-time telemetry from MongoDB `scan_sessions`, `traffic_logs`, and `sniffer_manager`.
  - Answers with exact anomaly counts, duration, and threat breakdowns from the latest scan run rather than generic widget referrals.
  - Chronological incident tracking with exact risk scores and model confidence for recent attacks.
  - **Fault-Tolerant Multi-Model Auto-Failover**: Seamless fallback hierarchy (`gemma-4-26b-a4b-it` $\rightarrow$ `gemini-3.1-flash-lite` $\rightarrow$ `gemini-3.5-flash-lite`) with exponential backoff retry handling for transient cloud blips (HTTP 500/502/503/504/429) and secure header-based token isolation (`x-goog-api-key`).

---

## Architecture Overview

```
[ Raw Network Wire / PCAP CSV ]
              |
      +-------+-------+
      |               |
      v (Wi-Fi/Eth)   v (CSV / Stream)
[ Live Sniffer ]  [ SSE Stream Engine ]
      |               |
      +-------+-------+
              |
              v
[ 81 NetFlow Feature Extraction ]
              |
              v
[ Dual-Model Ensemble: RF + XGBoost ]
              |
              v
[ Bidirectional QUIC / Web Normalizer ]
              |
              v
[ Context-Aware Risk Engine ]
              |
      +-------+-------+
      |               |
      v               v
[ scan_sessions ] [ traffic_logs ]
      |               |
      +-------+-------+
              |
              v
[ ZeroBreach AI Next.js 3D Dashboard ]
```

---

## Benchmark Dataset Reference (CICIDS2017)

| Dataset | Total Flows | Benchmark Attack Profile | Expected Behavior |
| :--- | :---: | :--- | :---: |
| **`monday.csv`** | 371,624 | Pure Benign Baseline (Zero Attacks) | **0 Anomalies** (Control baseline) |
| **`tuesday.csv`** | 445,909 | FTP-Patator & SSH-Patator | ~1,840 Anomalies |
| **`wednesday.csv`**| 692,703 | DoS Slowloris, Slowhttptest, Hulk, GoldenEye, Heartbleed | ~17,200 Anomalies |
| **`thursday.csv`** | 458,968 | Web Attacks (SQLi, XSS), Infiltration | ~8,420 Anomalies |
| **`friday.csv`** | 547,557 | Portscan & Volumetric DDoS | **259,207 Anomalies** (Critical Surge) |

---

## Quick Start

### 1. Backend Service (FastAPI)
```bash
cd backend
# Activate virtual environment
venv\Scripts\activate
# Start backend server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Application (Next.js)
```bash
cd frontend
# Install dependencies
npm install
# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the ZeroBreach AI platform.

---

## Research Notebooks Suite

The end-to-end model training, evaluation, and showdown pipelines are organized under [`notebooks/`](./notebooks):

1. **[`01_CICIDS2017_Pipeline.ipynb`](./notebooks/01_CICIDS2017_Pipeline.ipynb)**: Data ingestion, cleaning, and binary anomaly classification baseline.
2. **[`01b_CICIDS2017_Full_Multiclass.ipynb`](./notebooks/01b_CICIDS2017_Full_Multiclass.ipynb)**: Complete 15-class multiclass intrusion categorization pipeline.
3. **[`02_CICIDS2017_RandomForest_Baseline.ipynb`](./notebooks/02_CICIDS2017_RandomForest_Baseline.ipynb)**: Standalone Random Forest Model 1 baseline with rigorous test-set isolation.
4. **[`02b_CICIDS2017_DualModel_Ensemble_Final.ipynb`](./notebooks/02b_CICIDS2017_DualModel_Ensemble_Final.ipynb)**: **Flagship Dual-Model Ensemble** (Random Forest vs. XGBoost showdown, Dynamic Confidence Arbitration, and SOC risk scoring).
5. **[`03_CICIDS2017_Generalization_ZeroShot.ipynb`](./notebooks/03_CICIDS2017_Generalization_ZeroShot.ipynb)**: Cross-environment generalization and zero-shot transferability analysis.

---

## Evaluation Dataset

A curated benchmark dataset containing 4,001 flows spanning all CICIDS2017 attack types and benign traffic is included in:
* **Dataset File:** [`data/CICIDS2017_sample_traffic.csv`](./data/CICIDS2017_sample_traffic.csv)
* **Dataset Documentation:** [`data/README.md`](./data/README.md) (Attack distribution table and full dataset download links)

---

## Technical Documentation

* [`ZEROBREACH_AI_TECHNICAL_ARCHITECTURE.pdf`](./ZEROBREACH_AI_TECHNICAL_ARCHITECTURE.pdf): Complete architectural breakdown, mathematical risk scoring formulas, and MITRE ATT&CK mappings.
* [`AI_Network Anomaly Detection & Threat Monitoring System.pdf`](./AI_Network%20Anomaly%20Detection%20%26%20Threat%20Monitoring%20System.pdf): Executive and architectural presentation slides.
