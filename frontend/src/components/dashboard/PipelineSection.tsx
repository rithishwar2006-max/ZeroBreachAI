"use client";
import React from "react";

export default function PipelineSection() {
  return (
    <section
      id="modules"
      className="panel reveal"
      style={{
        border: "1px solid rgba(0, 200, 212, 0.3)",
        background: "rgba(5, 10, 24, 0.96)",
        backdropFilter: "blur(28px)",
        borderRadius: "16px",
        padding: "48px 36px 64px",
        maxWidth: "1180px",
        margin: "40px auto 60px auto",
        position: "relative",
        zIndex: 2,
        boxShadow: "0 25px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 200, 212, 0.1)",
        scrollMarginTop: "80px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "36px", padding: "0 16px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 14px",
            borderRadius: "20px",
            border: "1px solid rgba(0, 229, 255, 0.35)",
            background: "rgba(0, 229, 255, 0.08)",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#00f0ff",
              boxShadow: "0 0 10px #00f0ff",
            }}
          />
          <span
            style={{
              color: "#00f0ff",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            ENTERPRISE TELEMETRY LIFECYCLE
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--disp)",
            fontSize: "clamp(24px, 2.8vw, 32px)",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.2px",
            maxWidth: "100%",
            margin: "0 auto 12px auto",
            lineHeight: 1.35,
            width: "100%",
          }}
        >
          System Architecture &amp; ML Pipeline Specifications
        </h2>
        <p
          style={{
            color: "var(--text-low)",
            fontSize: "14.5px",
            maxWidth: "720px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Every network flow passes through seven deterministic telemetry stages before an alert is dispatched. Below is the end-to-end operational lifecycle from wire packet capture to Dual-Model Ensemble inference (Random Forest + XGBoost).
        </p>
      </div>

      <div
        className="blueprint"
        style={{
          background: "rgba(3, 7, 18, 0.75)",
          borderRadius: "10px",
          marginBottom: "32px",
          border: "1px solid rgba(0, 200, 212, 0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="bp-label">flow trace, one packet through seven stages</span>
        <svg
          className="trace-svg"
          viewBox="0 0 1100 220"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Diagram of one network flow passing through capture, preprocessing, feature extraction, anomaly detection, intrusion prediction, risk scoring, and alert response"
        >
          <path
            id="flow-path"
            d="M60,130 L223,80 L386,160 L549,70 L712,150 L875,90 L1038,130"
            fill="none"
            stroke="rgba(234,240,246,0.14)"
            strokeWidth="1.5"
          />
          <path
            id="flow-path-current"
            d="M60,130 L223,80 L386,160 L549,70 L712,150 L875,90 L1038,130"
            fill="none"
            stroke="var(--signal)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <g id="flow-dots"></g>
          <g fontFamily="IBM Plex Mono">
            <circle className="node-ring plain" cx="60" cy="130" r="13" />
            <text className="node-num" x="60" y="131">1</text>
            <circle className="node-ring plain" cx="223" cy="80" r="13" />
            <text className="node-num" x="223" y="81">2</text>
            <circle className="node-ring plain" cx="386" cy="160" r="13" />
            <text className="node-num" x="386" y="161">3</text>
            <circle className="node-ring core" cx="549" cy="70" r="13" />
            <text className="node-num" x="549" y="71">4</text>
            <circle className="node-ring core" cx="712" cy="150" r="13" />
            <text className="node-num" x="712" y="151">5</text>
            <circle className="node-ring core" cx="875" cy="90" r="13" />
            <text className="node-num" x="875" y="91">6</text>
            <circle className="node-ring plain" cx="1038" cy="130" r="13" />
            <text className="node-num" x="1038" y="131">7</text>
          </g>
        </svg>

        <div className="chip-row">
          <div className="chip">
            <div className="chip-viz viz-bars">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <h4>Traffic collection</h4>
            <p>Live packet and flow capture off the wire.</p>
          </div>
          <div className="chip">
            <div className="chip-viz">
              <svg className="viz-clean" viewBox="0 0 100 34">
                <polyline points="0,20 12,8 24,26 36,10 48,24 60,6 72,22 84,12 100,18" fill="none" stroke="rgba(234,240,246,0.25)" strokeWidth="1.4" />
                <polyline points="0,18 20,15 40,17 60,14 80,16 100,15" fill="none" stroke="#00c8d4" strokeWidth="1.8" />
              </svg>
            </div>
            <h4>Preprocessing</h4>
            <p>Deduplicate, clean, and normalize each flow.</p>
          </div>
          <div className="chip">
            <div className="chip-viz viz-tags">
              <span>flow_dur</span><span>fwd_iat</span><span>pkt_len</span>
            </div>
            <h4>Feature extraction</h4>
            <p>80+ statistical and time-based flow features.</p>
          </div>
          <div className="chip">
            <div className="chip-viz">
              <svg className="viz-scatter" viewBox="0 0 100 34">
                <circle cx="14" cy="20" r="3" fill="rgba(234,240,246,0.3)" />
                <circle cx="26" cy="14" r="3" fill="rgba(234,240,246,0.3)" />
                <circle cx="20" cy="26" r="3" fill="rgba(234,240,246,0.3)" />
                <circle cx="34" cy="22" r="3" fill="rgba(234,240,246,0.3)" />
                <circle cx="10" cy="10" r="3" fill="rgba(234,240,246,0.3)" />
                <circle cx="30" cy="8" r="3" fill="rgba(234,240,246,0.3)" />
                <circle cx="80" cy="16" r="3.5" fill="#c49a28" />
                <circle cx="80" cy="16" r="7" fill="none" stroke="#c49a28" strokeWidth="1.2" />
              </svg>
            </div>
            <h4>Anomaly detection</h4>
            <p>Statistical thresholds flag what breaks the baseline.</p>
          </div>
          <div className="chip">
            <div className="chip-viz viz-meter">
              <div className="track"><div className="fill" style={{ width: "72%" }}></div></div>
            </div>
            <h4>Intrusion prediction</h4>
            <p>Dual-Model Ensemble (Random Forest + XGBoost) arbitrates the flow against known attack families.</p>
          </div>
          <div className="chip">
            <div className="chip-viz viz-gauge">
              <svg width="34" height="34" viewBox="0 0 34 34">
                <path d="M5.74,24.5 A13,13 0 0 1 8.64,8.04" fill="none" stroke="#00c8d4" strokeWidth="3" strokeLinecap="round" />
                <path d="M8.64,8.04 A13,13 0 0 1 25.36,8.04" fill="none" stroke="#c49a28" strokeWidth="3" strokeLinecap="round" />
                <path d="M25.36,8.04 A13,13 0 0 1 28.26,24.5" fill="none" stroke="#ff0055" strokeWidth="3" strokeLinecap="round" />
                <line x1="17" y1="18" x2="23.8" y2="10.7" stroke="#EAF0F6" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="17" cy="18" r="1.8" fill="#EAF0F6" />
              </svg>
            </div>
            <h4>Risk scoring</h4>
            <p>A single 0-100 number, weighted by impact.</p>
          </div>
          <div className="chip">
            <div className="chip-viz viz-badge"><span className="badge-dot">1</span></div>
            <h4>Alert &amp; response</h4>
            <p>Routed straight to the analyst on call.</p>
          </div>
        </div>
      </div>

      <div
        className="statband"
        style={{
          padding: "28px 24px 20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(3, 7, 18, 0.5)",
          borderRadius: "10px",
          marginTop: "10px",
        }}
      >
        <div className="num">99.93%</div>
        <p>Detection accuracy across 2.1 million labeled flows from CICIDS2017, validated against DDoS, port scans, brute force, and other attack categories across all 13 threat classes.</p>
      </div>
    </section>
  );
}
