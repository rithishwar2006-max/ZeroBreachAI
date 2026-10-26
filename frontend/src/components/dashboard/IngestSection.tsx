"use client";
import React from "react";

export default function IngestSection() {
  return (
    <>
      <section
        id="ingest"
        className="wrap reveal"
        style={{ minHeight: "auto", padding: "18px 0 14px" }}
      >
        <div className="sec-head" style={{ padding: "10px 0 16px" }}>
          <h2 style={{ marginBottom: "6px" }}>Two ways to feed it traffic</h2>
          <p style={{ marginTop: "4px" }}>
            Point ZeroBreach AI at a live interface, or stream a benchmark dataset or custom file. Same pipeline, same dual-model ensemble, either way.
          </p>
        </div>

        <div className="ingest-panel">
          <div className="mode-switch" role="tablist" aria-label="Traffic input mode">
            <button
              type="button"
              className="mode-btn active"
              data-mode="live"
              role="tab"
              aria-selected="true"
              id="tab-live"
            >
              Live capture
            </button>
            <button
              type="button"
              className="mode-btn"
              data-mode="stream"
              role="tab"
              aria-selected="false"
              id="tab-stream"
            >
              File &amp; Dataset Stream
            </button>
            <span className="mode-thumb" id="mode-thumb" aria-hidden="true" />
          </div>

          {/* Mode 1: Live Hardware Capture */}
          <div
            className="mode-pane"
            data-pane="live"
            role="tabpanel"
            aria-labelledby="tab-live"
          >
            <div className="live-row">
              <div className="iface-select">
                <label htmlFor="iface">Interface</label>
                <select id="iface" defaultValue="Wi-Fi">
                  <option value="Wi-Fi">Wi-Fi</option>
                  <option value="Ethernet">Ethernet</option>
                  <option value="All">All interfaces</option>
                </select>
              </div>
              <button type="button" className="btn btn-primary" id="capture-toggle">
                Start capture
              </button>
            </div>
            <div className="live-status" id="live-status">
              <span className="dot" />
              <span id="capture-text">Not capturing</span>
            </div>
            <div className="mini-bars" id="mini-bars">
              <span /><span /><span /><span /><span /><span />
              <span /><span /><span /><span /><span /><span />
              <span /><span /><span /><span /><span /><span />
            </div>
          </div>

          {/* Mode 2: Unified File & Dataset SSE Stream */}
          <div
            className="mode-pane"
            data-pane="stream"
            role="tabpanel"
            aria-labelledby="tab-stream"
            hidden
          >
            {/* Stream Ingestion Source Selector */}
            <div style={{ marginBottom: "16px", padding: "12px 14px", background: "rgba(0,0,0,0.25)", border: "1px solid var(--line-strong)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--text-low)", textTransform: "uppercase" }}>INPUT SOURCE:</span>
                  <div style={{ display: "inline-flex", background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "6px", padding: "2px" }}>
                    <button
                      type="button"
                      id="source-tab-benchmark"
                      className="source-toggle-btn active"
                      style={{
                        padding: "5px 12px",
                        fontSize: "12px",
                        fontFamily: "var(--mono)",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        background: "rgba(0,200,212,0.15)",
                        color: "var(--signal)",
                        fontWeight: 600,
                        transition: "all .2s ease"
                      }}
                    >
                      📊 Benchmark Dataset
                    </button>
                    <button
                      type="button"
                      id="source-tab-custom"
                      className="source-toggle-btn"
                      style={{
                        padding: "5px 12px",
                        fontSize: "12px",
                        fontFamily: "var(--mono)",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        background: "transparent",
                        color: "var(--text-low)",
                        fontWeight: 500,
                        transition: "all .2s ease"
                      }}
                    >
                      📁 Custom File Upload (.csv / .pcap)
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                  <a
                    href="/sample_threat_traffic.csv"
                    download="sample_threat_traffic.csv"
                    id="download-sample-link"
                    style={{
                      fontSize: "11px",
                      color: "var(--signal)",
                      fontFamily: "var(--mono)",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    📥 Download Quick Sample (45 Flows)
                  </a>
                  <a
                    href="/sample_traffic.csv"
                    download="sample_traffic.csv"
                    id="download-full-sample-link"
                    style={{
                      fontSize: "11px",
                      color: "#38bdf8",
                      fontFamily: "var(--mono)",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    📥 Download Multi-Attack Sample (4,001 Flows)
                  </a>
                </div>
              </div>

              {/* Source View A: Benchmark Dataset Selector */}
              <div id="view-source-benchmark" style={{ display: "block" }}>
                <div className="iface-select" style={{ maxWidth: "520px" }}>
                  <label htmlFor="stream-dataset" style={{ color: "var(--text-low)", fontSize: "11px", fontFamily: "var(--mono)", marginBottom: "4px", display: "block" }}>
                    CICIDS2017 BENCHMARK SUITE
                  </label>
                  <select id="stream-dataset" defaultValue="friday.csv" style={{ width: "100%", background: "var(--panel-2)", color: "#fff", border: "1px solid var(--line-strong)", borderRadius: "6px", padding: "8px 12px", fontFamily: "var(--mono)", fontSize: "12px" }}>
                    <option value="monday.csv">CICIDS2017: Monday (Benign Baseline Traffic - 10,000 flows)</option>
                    <option value="tuesday.csv">CICIDS2017: Tuesday (FTP-Patator / SSH-Patator - 10,000 flows)</option>
                    <option value="wednesday.csv">CICIDS2017: Wednesday (DoS Slowloris / GoldenEye / Hulk - 10,000 flows)</option>
                    <option value="thursday.csv">CICIDS2017: Thursday (Web Attacks / Infiltration - 10,000 flows)</option>
                    <option value="friday.csv">CICIDS2017: Friday (Portscan / DDoS / Botnet - 10,000 flows)</option>
                    <option value="sample_traffic.csv">Multi-Attack Evaluation Suite (4,001 Diverse Flows)</option>
                    <option value="sample_threat_traffic.csv">Curated Benchmark (45 Balanced Flows)</option>
                  </select>
                </div>
              </div>

              {/* Source View B: Custom File Dropzone */}
              <div id="view-source-custom" style={{ display: "none" }}>
                <label className="dropzone" id="dropzone" htmlFor="stream-file-input" style={{ padding: "18px 16px", minHeight: "90px" }}>
                  <svg
                    id="dz-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 16V4M12 4l-4 4M12 4l4 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="dz-title" id="dz-title" style={{ fontSize: "13px" }}>Drop custom .csv or .pcap here</span>
                  <span className="dz-sub" id="dz-sub" style={{ fontSize: "11px" }}>or click to browse from disk</span>
                  <input type="file" id="stream-file-input" accept=".pcap,.pcapng,.csv" hidden />
                </label>
                <div className="file-info" id="file-info" hidden style={{ marginTop: "10px", padding: "8px 12px" }}>
                  <span className="file-name" id="file-name" style={{ fontSize: "12px" }} />
                  <span className="file-size" id="file-size" style={{ fontSize: "11px" }} />
                  <span style={{ fontSize: "11px", color: "var(--signal)", fontFamily: "var(--mono)", marginLeft: "auto" }}>Ready for stream scan</span>
                </div>
              </div>
            </div>

            {/* Stream Execution Tuning & Action Controls */}
            <div className="stream-scan-controls" style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-end", marginBottom: "16px" }}>
              <div className="iface-select" style={{ minWidth: "180px" }}>
                <label htmlFor="stream-chunk-size" style={{ color: "var(--text-low)", fontSize: "11px", fontFamily: "var(--mono)", marginBottom: "4px", display: "block" }}>
                  CHUNK SIZE (THROUGHPUT)
                </label>
                <select id="stream-chunk-size" defaultValue="2500" style={{ width: "100%", background: "var(--panel-2)", color: "#fff", border: "1px solid var(--line-strong)", borderRadius: "6px", padding: "8px 12px", fontFamily: "var(--mono)", fontSize: "12px" }}>
                  <option value="250">250 flows / chunk (Visual Paced)</option>
                  <option value="1000">1,000 flows / chunk (Fast - 7k/s)</option>
                  <option value="2500">2,500 flows / chunk (High Speed - 13k/s)</option>
                  <option value="5000">5,000 flows / chunk (Ultra Speed - 18k/s)</option>
                  <option value="10000">10,000 flows / chunk (Max Turbo - 24k/s)</option>
                </select>
              </div>

              <div className="iface-select" style={{ minWidth: "180px" }}>
                <label htmlFor="stream-max-flows" style={{ color: "var(--text-low)", fontSize: "11px", fontFamily: "var(--mono)", marginBottom: "4px", display: "block" }}>
                  SCAN LIMIT
                </label>
                <select id="stream-max-flows" defaultValue="10000" style={{ width: "100%", background: "var(--panel-2)", color: "#fff", border: "1px solid var(--line-strong)", borderRadius: "6px", padding: "8px 12px", fontFamily: "var(--mono)", fontSize: "12px" }}>
                  <option value="1000">1,000 flows (Quick)</option>
                  <option value="5000">5,000 flows (Standard)</option>
                  <option value="10000">10,000 flows (Deep)</option>
                  <option value="25000">25,000 flows (Large Batch)</option>
                  <option value="50000">50,000 flows (Heavy Analysis)</option>
                  <option value="100000">100,000 flows (Deep Mining)</option>
                  <option value="0">Full Dataset Scan (Unlimited)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn btn-primary" id="stream-scan-btn">
                  Start Streaming Scan
                </button>
                <button type="button" className="btn" id="stream-stop-btn" style={{ display: "none", background: "rgba(255,0,85,0.15)", border: "1px solid #ff0055", color: "#ff0055" }}>
                  Stop Scan
                </button>
              </div>
            </div>

            {/* Live Streaming Metrics Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "14px" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--line-strong)", borderRadius: "8px", padding: "10px 14px" }}>
                <div style={{ color: "var(--text-low)", fontSize: "10px", fontFamily: "var(--mono)" }}>STREAM STATUS</div>
                <div id="stream-status-text" style={{ color: "var(--signal)", fontSize: "13px", fontWeight: 700, fontFamily: "var(--mono)", marginTop: "2px" }}>
                  <span className="dot" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#666", marginRight: "6px" }} />
                  IDLE
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--line-strong)", borderRadius: "8px", padding: "10px 14px" }}>
                <div style={{ color: "var(--text-low)", fontSize: "10px", fontFamily: "var(--mono)" }}>SCANNED FLOWS</div>
                <div id="stream-scanned-count" style={{ color: "#fff", fontSize: "16px", fontWeight: 700, fontFamily: "var(--mono)", marginTop: "2px" }}>0</div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--line-strong)", borderRadius: "8px", padding: "10px 14px" }}>
                <div style={{ color: "var(--text-low)", fontSize: "10px", fontFamily: "var(--mono)" }}>ANOMALIES DETECTED</div>
                <div id="stream-anom-count" style={{ color: "var(--critical)", fontSize: "16px", fontWeight: 700, fontFamily: "var(--mono)", marginTop: "2px" }}>0</div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--line-strong)", borderRadius: "8px", padding: "10px 14px" }}>
                <div style={{ color: "var(--text-low)", fontSize: "10px", fontFamily: "var(--mono)" }}>ACTIVE CHUNK</div>
                <div id="stream-chunk-id" style={{ color: "#00f0ff", fontSize: "16px", fontWeight: 700, fontFamily: "var(--mono)", marginTop: "2px" }}>#0</div>
              </div>
            </div>

            {/* Rolling Window Live Feed Table */}
            <div style={{ border: "1px solid var(--line-strong)", borderRadius: "8px", overflow: "hidden", background: "rgba(0,0,0,0.4)" }}>
              <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--line-strong)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--text-low)" }}>LIVE CHUNK FEED (ROLLING WINDOW ~150 ROWS)</span>
                <span id="stream-connection-badge" style={{ fontSize: "9.5px", fontFamily: "var(--mono)", padding: "1px 6px", borderRadius: "3px", background: "rgba(0,200,212,0.1)", color: "var(--signal)", border: "1px solid rgba(0,200,212,0.3)" }}>SSE HTTP/2</span>
              </div>
              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: "var(--mono)", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--text-low)" }}>
                      <th style={{ padding: "6px 10px" }}>TIME</th>
                      <th style={{ padding: "6px 10px" }}>SOURCE</th>
                      <th style={{ padding: "6px 10px" }}>TARGET</th>
                      <th style={{ padding: "6px 10px" }}>PROTO</th>
                      <th style={{ padding: "6px 10px" }}>VERDICT</th>
                      <th style={{ padding: "6px 10px" }}>RISK</th>
                      <th style={{ padding: "6px 10px" }}>MODEL</th>
                    </tr>
                  </thead>
                  <tbody id="stream-table-body">
                    <tr>
                      <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "var(--text-low)" }}>
                        Ready to scan. Select a benchmark dataset or upload a custom CSV, then click &quot;Start Streaming Scan&quot; to begin the live chunked stream from row 1.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Telemetry Strip */}
      <div className="strip reveal">
        <div className="wrap strip-row">
          <div className="strip-item">
            <div className="strip-label">Malicious flows detected</div>
            <div className="strip-value" id="v1">2,841,920</div>
          </div>
          <div className="strip-item">
            <div className="strip-label">Anomalies found</div>
            <div className="strip-value" id="v-found" style={{ color: "var(--signal-bright, #00f0ff)" }}>0</div>
          </div>
          <div className="strip-item">
            <div className="strip-label">Anomalies today</div>
            <div className="strip-value warn" id="v2">14,280</div>
          </div>
          <div className="strip-item">
            <div className="strip-label">Model accuracy</div>
            <div className="strip-value good" id="v3">99.93%</div>
          </div>
          <div className="strip-item">
            <div className="strip-label">Threat categories</div>
            <div className="strip-value" id="v4">13</div>
          </div>
        </div>
      </div>
    </>
  );
}
