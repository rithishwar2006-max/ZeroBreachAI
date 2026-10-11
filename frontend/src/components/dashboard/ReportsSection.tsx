"use client";
import React from "react";

export default function ReportsSection() {
  const handleDownloadCSV = () => {
    if (typeof (window as any).downloadCSV === "function") {
      (window as any).downloadCSV();
    }
  };

  const handleDownloadSIEM = () => {
    if (typeof (window as any).downloadSIEM === "function") {
      (window as any).downloadSIEM();
    }
  };

  const handleDownloadBackup = () => {
    if (typeof (window as any).downloadBackup === "function") {
      (window as any).downloadBackup();
    }
  };

  return (
    <section
      id="reports"
      style={{
        padding: "40px 32px",
        maxWidth: "1180px",
        margin: "0 auto",
        borderTop: "1px solid var(--line)",
      }}
    >
      <h2 style={{ fontFamily: "var(--disp)", fontSize: "24px", marginBottom: "20px" }}>
        Reports &amp; SIEM Exports
      </h2>
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "8px",
          padding: "24px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>
            Compliance &amp; SIEM Data Ingestion
          </h3>
          <p style={{ color: "var(--text-low)", fontSize: "14px" }}>
            Download audited traffic logs for compliance, or stream live Elastic Common Schema (ECS) JSON for direct ingestion into Splunk, QRadar, and Elasticsearch.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="btn btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              border: "1px solid var(--line)",
              cursor: "pointer",
              fontFamily: "var(--mono)",
              padding: "10px 16px",
              fontSize: "13px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Full CSV
          </button>
          <button
            type="button"
            onClick={handleDownloadSIEM}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--mono)",
              padding: "10px 16px",
              fontSize: "13px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Export to SIEM (JSON)
          </button>
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="btn btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              border: "1px solid var(--line)",
              cursor: "pointer",
              fontFamily: "var(--mono)",
              padding: "10px 16px",
              fontSize: "13px",
            }}
            title="Download timestamped JSON snapshot of database state"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Backup Snapshot
          </button>
        </div>
      </div>
    </section>
  );
}
