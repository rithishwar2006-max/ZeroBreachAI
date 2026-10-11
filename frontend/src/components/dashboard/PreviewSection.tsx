"use client";
import React from "react";

export default function PreviewSection() {
  const handleOpenFullLog = () => {
    if (typeof (window as any).openFullLogModal === "function") {
      (window as any).openFullLogModal();
    }
  };

  const handleFilterLog = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof (window as any).filterLogList === "function") {
      (window as any).filterLogList(e.currentTarget.value);
    }
  };

  return (
    <section id="preview" className="preview reveal">
      <div className="wrap" style={{ maxWidth: "1280px" }}>
        <div className="sec-head" style={{ paddingTop: 0 }}>
          <h2>See it triage a live incident</h2>
          <p>A flagged flow, scored and explained, the moment it crosses the baseline.</p>
        </div>
        <div className="stage">
          <div className="screen">
            <div className="screen-top">
              <span className="screen-title">Traffic monitor</span>
              <span className="live-tag">
                <span className="dot" />LIVE
              </span>
            </div>
            <div className="screen-body">
              <div className="chart-card cyber-reticle" id="flow-card">
                <div
                  className="card-head"
                  style={{
                    alignItems: "center",
                    paddingBottom: "12px",
                    marginBottom: "6px",
                  }}
                >
                  <div
                    className="chart-label"
                    style={{
                      fontFamily: "var(--disp)",
                      fontSize: "14px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--text-high)",
                    }}
                  >
                    Anomalies (Upload &amp; Live Sniffer)
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontFamily: "var(--mono)",
                        fontSize: "12px",
                        color: "#cbd5e1",
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <span
                          style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "3px",
                            background: "#00f0ff",
                            boxShadow: "0 0 8px #00f0ff",
                          }}
                        />
                        &lt;1K Low
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <span
                          style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "3px",
                            background: "#ffb703",
                            boxShadow: "0 0 8px #ffb703",
                          }}
                        />
                        1K-50K Elevated
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <span
                          style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "3px",
                            background: "#ff0055",
                            boxShadow: "0 0 8px #ff0055",
                          }}
                        />
                        &gt;50K Critical
                      </span>
                    </div>
                    <span
                      className="scope-tag"
                      id="chart-scope"
                      style={{ fontSize: "11px", padding: "4px 10px", fontWeight: 600 }}
                    >
                      ALL SESSIONS
                    </span>
                  </div>
                </div>
                <div
                  className="chart-wrap"
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "310px",
                      overflow: "hidden",
                    }}
                  >
                    <canvas
                      id="flow-wave-canvas"
                      style={{ width: "100%", height: "310px", display: "block" }}
                    />
                    <div
                      id="flow-wave-tooltip"
                      style={{
                        position: "absolute",
                        display: "none",
                        pointerEvents: "none",
                        zIndex: 30,
                        background: "rgba(6,14,32,0.96)",
                        border: "1px solid #00c8d4",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        fontFamily: "var(--mono)",
                        fontSize: "11.5px",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.85), 0 0 20px rgba(0,200,212,0.25)",
                        color: "#f8fafc",
                        backdropFilter: "blur(12px)",
                        maxWidth: "280px",
                      }}
                    />
                  </div>
                  <div className="bars" id="flow-bars" style={{ display: "none" }} />
                  <div
                    className="bar-labels"
                    id="bar-labels"
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      textAlign: "center",
                      marginTop: "8px",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--text-low)",
                      opacity: 0.85,
                    }}
                  />
                </div>
              </div>

              <div className="chart-card cyber-reticle" id="protocol-card">
                <div className="card-head">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--nebula)",
                        boxShadow: "0 0 8px var(--nebula)",
                      }}
                    />
                    <div
                      className="chart-label"
                      style={{
                        fontFamily: "var(--disp)",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-high)",
                      }}
                    >
                      Protocol Distribution
                    </div>
                  </div>
                </div>
                <div
                  className="chart-wrap"
                  style={{
                    position: "relative",
                    height: "250px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <canvas
                    id="protocol-radar-canvas"
                    style={{ width: "100%", height: "250px", display: "block" }}
                  />
                </div>
                <div
                  id="protocol-bars"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))",
                    gap: "6px",
                    width: "100%",
                    marginTop: "8px",
                  }}
                >
                  {/* Injected via JS */}
                </div>
              </div>
            </div>

            {/* SEPARATE DEDICATED FULL-WIDTH RECENT LOGS & TELEMETRY STREAM */}
            <div
              className="feed-card cyber-reticle"
              id="logs-card"
              style={{
                marginTop: "22px",
                width: "100%",
                border: "1px solid rgba(0,200,212,0.25)",
                background: "rgba(6,12,26,0.85)",
                padding: "20px 22px",
              }}
            >
              <div>
                <div
                  className="card-head"
                  style={{
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    paddingBottom: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="beacon-dot" />
                    <div>
                      <div
                        className="chart-label"
                        style={{
                          fontFamily: "var(--disp)",
                          fontSize: "13px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--text-high)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        Incident &amp; Telemetry Log Stream
                        <span
                          className="scope-tag"
                          style={{
                            background: "rgba(0,200,212,0.1)",
                            border: "1px solid rgba(0,200,212,0.3)",
                            color: "#00c8d4",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 600,
                          }}
                        >
                          LIVE STREAM
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          fontFamily: "var(--mono)",
                          marginTop: "2px",
                        }}
                      >
                        Real-time deep packet anomaly logs across monitored endpoints
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      id="log-search-input"
                      type="text"
                      placeholder="Filter by IP, Attack, or Risk..."
                      style={{
                        background: "rgba(3,7,18,0.85)",
                        border: "1px solid rgba(0,200,212,0.25)",
                        borderRadius: "6px",
                        color: "#f8fafc",
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        padding: "6px 14px",
                        width: "240px",
                        outline: "none",
                      }}
                      onKeyUp={handleFilterLog}
                    />
                    <button
                      type="button"
                      onClick={handleOpenFullLog}
                      className="btn"
                      style={{
                        background: "rgba(0,200,212,0.1)",
                        border: "1px solid rgba(0,200,212,0.35)",
                        color: "#00c8d4",
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "rgba(0,200,212,0.25)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "rgba(0,200,212,0.1)";
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      Full Log History
                    </button>
                  </div>
                </div>
                <div
                  className="log-list"
                  id="log-list"
                  style={{ maxHeight: "280px", overflowY: "auto" }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "14px",
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                <span id="log-status-text">Showing recent captured anomaly events</span>
                <button
                  type="button"
                  className="log-more"
                  id="log-more"
                  style={{
                    marginTop: 0,
                    paddingTop: 0,
                    borderTop: "none",
                    width: "auto",
                    color: "#00c8d4",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Load more logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
