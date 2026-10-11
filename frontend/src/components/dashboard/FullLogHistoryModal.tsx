"use client";
import React from "react";

export default function FullLogHistoryModal() {
  const handleClose = () => {
    if (typeof (window as any).closeFullLogModal === "function") {
      (window as any).closeFullLogModal();
    } else {
      const el = document.getElementById("full-log-history-modal");
      if (el) el.style.display = "none";
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof (window as any).filterModalLogs === "function") {
      (window as any).filterModalLogs(e.currentTarget.value);
    }
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (typeof (window as any).filterModalSeverity === "function") {
      (window as any).filterModalSeverity(e.target.value);
    }
  };

  const handleExportCSV = () => {
    if (typeof (window as any).exportModalLogsCSV === "function") {
      (window as any).exportModalLogsCSV();
    }
  };

  const handleChangePage = (delta: number) => {
    if (typeof (window as any).changeModalLogPage === "function") {
      (window as any).changeModalLogPage(delta);
    }
  };

  return (
    <div
      id="full-log-history-modal"
      style={{
        display: "none",
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "rgba(2,6,18,0.88)",
        zIndex: 1060,
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(16px)",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "rgba(8,16,34,0.96)",
          border: "1px solid rgba(0,200,212,0.35)",
          borderRadius: "16px",
          width: "1100px",
          maxWidth: "96%",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: "0 30px 80px rgba(0,0,0,0.85), 0 0 35px rgba(0,200,212,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="beacon-dot" />
            <div>
              <h2
                style={{
                  fontFamily: "var(--disp)",
                  fontSize: "18px",
                  color: "#fff",
                  margin: 0,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                FULL INCIDENT &amp; TELEMETRY LOG ARCHIVE
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    background: "rgba(0,200,212,0.12)",
                    color: "#00c8d4",
                    border: "1px solid rgba(0,200,212,0.35)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  FORENSIC AUDIT
                </span>
              </h2>
              <div
                style={{
                  color: "var(--text-low)",
                  fontSize: "11.5px",
                  fontFamily: "var(--mono)",
                  marginTop: "3px",
                }}
              >
                Comprehensive packet anomaly logs, intrusion scores, and endpoint traffic traces
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#94a3b8",
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "20px",
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
        </div>

        {/* Modal Controls Bar */}
        <div
          style={{
            padding: "14px 24px",
            background: "rgba(5,11,24,0.6)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, maxWidth: "480px" }}>
            <input
              id="modal-log-search"
              type="text"
              placeholder="Search by IP, Threat Type, Timestamp..."
              style={{
                flex: 1,
                background: "rgba(3,7,18,0.85)",
                border: "1px solid rgba(0,200,212,0.25)",
                borderRadius: "6px",
                color: "#f8fafc",
                fontFamily: "var(--mono)",
                fontSize: "12px",
                padding: "7px 14px",
                outline: "none",
              }}
              onKeyUp={handleSearch}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select
              id="modal-severity-filter"
              onChange={handleSeverityChange}
              defaultValue="ALL"
              style={{
                background: "rgba(3,7,18,0.85)",
                border: "1px solid rgba(0,200,212,0.25)",
                borderRadius: "6px",
                color: "#f8fafc",
                fontFamily: "var(--mono)",
                fontSize: "11px",
                padding: "7px 12px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical &amp; High Risk</option>
              <option value="ELEVATED">Medium Risk</option>
              <option value="LOW">Low Risk / Baseline</option>
            </select>
            <button
              type="button"
              onClick={handleExportCSV}
              className="btn btn-secondary"
              style={{
                fontSize: "11px",
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--mono)",
                borderColor: "rgba(0,200,212,0.3)",
                color: "#00c8d4",
              }}
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--mono)",
              fontSize: "11.5px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(0,200,212,0.25)",
                  color: "#94a3b8",
                  fontSize: "10.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  position: "sticky",
                  top: 0,
                  background: "rgba(8,16,34,0.98)",
                  zIndex: 10,
                }}
              >
                <th style={{ padding: "12px 10px" }}>#</th>
                <th style={{ padding: "12px 10px" }}>Timestamp</th>
                <th style={{ padding: "12px 10px" }}>Classification</th>
                <th style={{ padding: "12px 10px" }}>Risk Score</th>
                <th style={{ padding: "12px 10px" }}>Source IP &rarr; Target IP</th>
                <th style={{ padding: "12px 10px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody id="modal-log-tbody">
              {/* Injected via JS */}
            </tbody>
          </table>
        </div>

        {/* Modal Footer / Pagination */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            id="modal-log-pagination-info"
            style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "#94a3b8" }}
          >
            Showing logs
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              id="modal-prev-btn"
              onClick={() => handleChangePage(-1)}
              className="btn btn-secondary"
              style={{ fontSize: "11px", padding: "4px 12px", fontFamily: "var(--mono)" }}
            >
              &larr; Prev
            </button>
            <span
              id="modal-current-page"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11.5px",
                color: "#00c8d4",
                fontWeight: 700,
                padding: "0 6px",
              }}
            >
              Page 1
            </span>
            <button
              type="button"
              id="modal-next-btn"
              onClick={() => handleChangePage(1)}
              className="btn btn-secondary"
              style={{ fontSize: "11px", padding: "4px 12px", fontFamily: "var(--mono)" }}
            >
              Next &rarr;
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-primary"
              style={{ marginLeft: "12px", fontSize: "11px", padding: "5px 16px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
