# ZeroBreach AI — Frontend Dashboard Architecture

The ZeroBreach AI frontend is an enterprise Next.js application designed for Security Operations Centers (SOC). It provides real-time traffic monitoring, 3D volumetric cylinder anomaly visualizations, high-speed SSE stream telemetry, incident ticketing, and role-based access control (RBAC).

---

## 1. Key Features

- **3D Isometric Frosted Glass Anomaly Pillars (Three.js WebGL)**:
  - Renders volumetric cylinder bars representing past and active scan sessions.
  - Distinct **`● LIVE CAPTURE`** pulsing emerald beacon for hardware sniffer sessions.
  - Adaptive logarithmic height scaling, neon ground blooms, and raycast inspection tooltips.
- **Server-Sent Events (SSE) Live Feed**:
  - Connects to `/api/sniffer/stream-dataset` for chunked streaming at 23,000+ flows/second.
  - Real-time progress bar, estimated time remaining, throughput tracker, and live anomaly feed.
- **28-Channel Threat Frequency Spectrum**:
  - Spectral audio/frequency visualizer across Low Risk, Baseline, Suspicious, and Critical attack bands.
- **Holographic 3D Protocol Radar**:
  - Three.js geodesic rotating wireframe globe mapping Layer 4 transport protocol distribution (TCP, UDP, ICMP, Other).
- **Enterprise RBAC Views**:
  - Role-specific UI permissions for `admin`, `soc`, `analyst`, and `enterprise`.
- **SIEM Export & Snapshot Backups**:
  - JSON/CSV export and automated disaster recovery snapshot management.

---

## 2. Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx         # Root layout with font and metadata configuration
│   ├── page.tsx           # Main enterprise dashboard entry point
│   ├── login/page.tsx     # Authentication & JWT role-based login
│   ├── settings/page.tsx  # Platform configuration & API keys
│   └── tickets/page.tsx   # SOC incident ticket response workbench
├── components/            # Reusable UI components & metrics cards
├── hooks/                 # Custom React hooks for telemetry polling & SSE
├── lib/                   # API client, token helpers, and utilities
├── public/
│   └── scripts/
│       └── dashboard-runtime.js  # Three.js 3D volumetric visualizer runtime
└── package.json
```

---

## 3. Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
