"use client";
import React from "react";

export default function ThreatIntelSection() {
  return (
    <section
      id="threat-intel-analytics"
      style={{
        padding: "24px 32px 40px",
        maxWidth: "1180px",
        margin: "0 auto",
        borderTop: "1px solid var(--line)",
        scrollMarginTop: "80px",
      }}
    >
      <div className="sec-head" style={{ paddingTop: "12px", paddingBottom: "16px" }}>
        <h2 style={{ fontFamily: "var(--disp)", fontSize: "24px", marginBottom: "8px" }}>
          Threat Intelligence &amp; Analytics
        </h2>
        <p style={{ color: "var(--text-low)", marginBottom: "20px" }}>
          Deep telemetry inspection, attacker profiling, and high-risk asset triage.
        </p>
      </div>

      {/* Real-Time Threat Frequency Spectrum */}
      <div
        className="cyber-reticle"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "18px 24px",
          marginBottom: "24px",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="beacon-dot" />
            <span
              style={{
                fontFamily: "var(--font-cyber, 'Audiowide')",
                fontSize: "12px",
                letterSpacing: "0.1em",
                color: "var(--signal)",
                textTransform: "uppercase",
              }}
            >
              Real-Time Threat Frequency Spectrum
            </span>
            <span
              id="threat-spectrum-status-badge"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "4px",
                background: "rgba(0,200,212,0.12)",
                color: "#00c8d4",
                border: "1px solid rgba(0,200,212,0.3)",
                textTransform: "uppercase",
              }}
            >
              LIVE TELEMETRY // 28 CHANNELS
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11px",
              color: "#64748b",
            }}
          >
            <span id="threat-spectrum-summary">[FETCHING LIVE TELEMETRY...]</span>
            <span
              id="threat-spectrum-dominant"
              style={{
                padding: "2px 6px",
                borderRadius: "3px",
                fontSize: "10px",
                background: "rgba(255,0,85,0.15)",
                color: "#ff0055",
                border: "1px solid rgba(255,0,85,0.3)",
              }}
            >
              CRITICAL
            </span>
          </div>
        </div>
        <div
          style={{ width: "100%", height: "86px", position: "relative" }}
          id="threat-spectrum-container"
        >
          <canvas
            id="threat-spectrum-canvas"
            style={{ width: "100%", height: "86px", display: "block", cursor: "crosshair" }}
          />
          <div
            id="threat-spectrum-tooltip"
            style={{
              position: "absolute",
              display: "none",
              pointerEvents: "none",
              background: "rgba(6,11,25,0.92)",
              border: "1px solid rgba(0,200,212,0.5)",
              borderRadius: "4px",
              padding: "4px 8px",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "10px",
              color: "#f1f5f9",
              boxShadow: "0 4px 14px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "10px",
            color: "#64748b",
            marginTop: "8px",
          }}
        >
          <span style={{ color: "#00c8d4" }}>LOW_RISK_BAND (0-25%)</span>
          <span style={{ color: "#38bdf8" }}>BASELINE_TRAFFIC (25-50%)</span>
          <span style={{ color: "#a855f7" }}>SUSPICIOUS_PROBES (50-75%)</span>
          <span style={{ color: "#ff0055", fontWeight: 700 }}>CRITICAL_ANOMALIES (75-100%)</span>
        </div>
      </div>

      {/* Behavior Insights Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              color: "var(--text-low)",
              letterSpacing: "0.5px",
              fontFamily: "var(--mono)",
            }}
          >
            Dominant Attack Vector
          </span>
          <div
            id="intel-vector"
            style={{ fontSize: "20px", fontWeight: 700, color: "#e53935", marginTop: "6px" }}
          >
            Port Scan
          </div>
          <p style={{ color: "var(--text-low)", fontSize: "12px", margin: "4px 0 0 0" }}>
            Triggering rapid multi-host probes
          </p>
        </div>

        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              color: "var(--text-low)",
              letterSpacing: "0.5px",
              fontFamily: "var(--mono)",
            }}
          >
            Primary Targeted Asset
          </span>
          <div
            id="intel-host"
            style={{ fontSize: "20px", fontWeight: 700, color: "var(--signal)", marginTop: "6px" }}
          >
            192.168.10.50
          </div>
          <p style={{ color: "var(--text-low)", fontSize: "12px", margin: "4px 0 0 0" }}>
            Internal Database Cluster
          </p>
        </div>

        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              color: "var(--text-low)",
              letterSpacing: "0.5px",
              fontFamily: "var(--mono)",
            }}
          >
            Total Anomaly Ingest
          </span>
          <div
            id="intel-total"
            style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "6px" }}
          >
            168 Events
          </div>
          <p style={{ color: "var(--text-low)", fontSize: "12px", margin: "4px 0 0 0" }}>
            Validated by Dual-Model Ensemble (RF + XGBoost)
          </p>
        </div>

        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              color: "var(--text-low)",
              letterSpacing: "0.5px",
              fontFamily: "var(--mono)",
            }}
          >
            Threat Hunting Status
          </span>
          <div
            style={{ fontSize: "20px", fontWeight: 700, color: "#2BD4AD", marginTop: "6px" }}
          >
            Active Watch
          </div>
          <p style={{ color: "var(--text-low)", fontSize: "12px", margin: "4px 0 0 0" }}>
            Live baseline tracking enabled
          </p>
        </div>
      </div>

      {/* Tables Grid: Top Attackers & Top Targets */}
      <div className="threat-tables-grid">
        {/* Top Attackers */}
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "20px",
            overflowX: "auto",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              margin: "0 0 14px 0",
              color: "#e53935",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Top Malicious Attackers (Source IPs)
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--text-low)", textAlign: "left" }}>
                <th style={{ padding: "8px 4px" }}>Attacker IP</th>
                <th style={{ padding: "8px 4px" }}>Attack Type</th>
                <th style={{ padding: "8px 4px" }}>Flows</th>
                <th style={{ padding: "8px 4px" }}>Risk</th>
              </tr>
            </thead>
            <tbody id="top-attackers-body">
              <tr>
                <td colSpan={4} style={{ padding: "12px", textAlign: "center", color: "var(--text-low)" }}>
                  Loading threat actors...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Top Targeted Assets */}
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "20px",
            overflowX: "auto",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              margin: "0 0 14px 0",
              color: "var(--signal)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Top Targeted Network Assets (Victims)
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--text-low)", textAlign: "left" }}>
                <th style={{ padding: "8px 4px" }}>Target Asset IP</th>
                <th style={{ padding: "8px 4px" }}>Incident Count</th>
                <th style={{ padding: "8px 4px" }}>Avg Severity</th>
                <th style={{ padding: "8px 4px" }}>Status</th>
              </tr>
            </thead>
            <tbody id="top-targets-body">
              <tr>
                <td colSpan={4} style={{ padding: "12px", textAlign: "center", color: "var(--text-low)" }}>
                  Loading targeted assets...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
