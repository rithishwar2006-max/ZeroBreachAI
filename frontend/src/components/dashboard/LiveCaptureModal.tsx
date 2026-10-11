"use client";
import React from "react";

export default function LiveCaptureModal() {
  const handleClose = () => {
    const el = document.getElementById("live-capture-modal");
    if (el) el.style.display = "none";
  };

  const handleExport = () => {
    if (typeof (window as any).exportLiveCaptureSession === "function") {
      (window as any).exportLiveCaptureSession();
    }
  };

  const handleInvestigate = () => {
    handleClose();
    const el = document.getElementById("preview");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      id="live-capture-modal"
      style={{
        display: "none",
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "rgba(3,6,15,0.85)",
        zIndex: 1050,
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(12px)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "rgba(8,16,34,0.95)",
          border: "1px solid rgba(0,240,255,0.3)",
          borderRadius: "18px",
          width: "780px",
          maxWidth: "95%",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "28px",
          position: "relative",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0,240,255,0.15)",
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#94a3b8",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#00f0ff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }}
        >
          &times;
        </button>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 10px",
            borderRadius: "20px",
            border: "1px solid rgba(0,240,255,0.3)",
            background: "rgba(0,240,255,0.08)",
            marginBottom: "12px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00f0ff" }} />
          <span
            style={{
              color: "#00f0ff",
              fontFamily: "var(--mono)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            LIVE SESSION COMPLETE
          </span>
          <span
            id="lcr-anom-badge"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "9.5px",
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: "4px",
              border: "1px solid rgba(16,185,129,0.3)",
              background: "rgba(16,185,129,0.1)",
              color: "#10b981",
            }}
          >
            ALL CLEAR // BENIGN
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--disp)",
            fontSize: "22px",
            color: "#fff",
            margin: "0 0 6px 0",
            fontWeight: 700,
          }}
        >
          Live Packet Capture Analysis Report
        </h2>
        <p style={{ color: "var(--text-low)", fontSize: "13px", margin: "0 0 22px 0" }}>
          Telemetry and automated ML threat classification from real-time interface sniffer.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                color: "var(--text-low)",
                fontSize: "10.5px",
                fontFamily: "var(--mono)",
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}
            >
              CAPTURE DURATION
            </div>
            <div
              id="lcr-duration"
              style={{ fontFamily: "var(--mono)", fontSize: "20px", fontWeight: 700, color: "#00f0ff" }}
            >
              00m 00s
            </div>
            <div
              id="lcr-time-range"
              style={{ color: "var(--text-low)", fontSize: "10px", fontFamily: "var(--mono)", marginTop: "4px" }}
            >
              -- : --
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                color: "var(--text-low)",
                fontSize: "10.5px",
                fontFamily: "var(--mono)",
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}
            >
              TOTAL FLOWS
            </div>
            <div
              id="lcr-total-flows"
              style={{ fontFamily: "var(--mono)", fontSize: "20px", fontWeight: 700, color: "#fff" }}
            >
              0 Flows
            </div>
            <div
              style={{ color: "var(--text-low)", fontSize: "10px", fontFamily: "var(--mono)", marginTop: "4px" }}
            >
              Completed sessions
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                color: "var(--text-low)",
                fontSize: "10.5px",
                fontFamily: "var(--mono)",
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}
            >
              THREATS DETECTED
            </div>
            <div
              id="lcr-anomalies"
              style={{ fontFamily: "var(--mono)", fontSize: "20px", fontWeight: 700, color: "#10b981" }}
            >
              0 Anomalies
            </div>
            <div
              style={{ color: "var(--text-low)", fontSize: "10px", fontFamily: "var(--mono)", marginTop: "4px" }}
            >
              ML Classified
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                color: "var(--text-low)",
                fontSize: "10.5px",
                fontFamily: "var(--mono)",
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}
            >
              INTERFACE
            </div>
            <div
              id="lcr-interface"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "18px",
                fontWeight: 700,
                color: "#38bdf8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Wi-Fi
            </div>
            <div
              style={{ color: "var(--text-low)", fontSize: "10px", fontFamily: "var(--mono)", marginTop: "4px" }}
            >
              Live Promiscuous
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-low)", marginBottom: "8px" }}>
              PROTOCOLS CAPTURED
            </div>
            <div id="lcr-protocols" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }} />
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-low)", marginBottom: "8px" }}>
              VERDICT BREAKDOWN
            </div>
            <div id="lcr-threats" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }} />
          </div>
        </div>

        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#94a3b8",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>RECENT CAPTURED FLOWS (SESSION)</span>
            <span style={{ color: "var(--signal)" }}>LIVE ML INGESTION</span>
          </div>

          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    color: "var(--text-low)",
                    textTransform: "uppercase",
                  }}
                >
                  <th style={{ padding: "8px 6px" }}>Time</th>
                  <th style={{ padding: "8px 6px" }}>Source</th>
                  <th style={{ padding: "8px 6px" }}>Target</th>
                  <th style={{ padding: "8px 6px" }}>Proto</th>
                  <th style={{ padding: "8px 6px" }}>Verdict</th>
                  <th style={{ padding: "8px 6px" }}>Risk</th>
                </tr>
              </thead>
              <tbody id="lcr-flows-tbody" />
            </table>

            <div
              id="lcr-empty-note"
              style={{
                display: "none",
                padding: "24px",
                textAlign: "center",
                color: "var(--text-low)",
                fontSize: "12.5px",
              }}
            >
              <div style={{ fontSize: "22px", marginBottom: "6px" }}>🌐</div>
              <strong>No network flows completed during this capture window.</strong>
              <div style={{ fontSize: "11px", marginTop: "4px", color: "#64748b" }}>
                Try browsing websites or streaming media while live capture is active to generate packets for the sniffer.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <button
            type="button"
            onClick={handleExport}
            className="btn btn-secondary"
            style={{ padding: "8px 14px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span>📥</span> Export Session JSON
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handleInvestigate}
              className="btn btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              Investigate Telemetry &rarr;
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              style={{ padding: "8px 14px", fontSize: "12px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
