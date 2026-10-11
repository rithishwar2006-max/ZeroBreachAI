"use client";
import React from "react";

export default function SOCAlertToast() {
  const handleClose = () => {
    const el = document.getElementById("soc-alert-toast");
    if (el) el.style.display = "none";
  };

  return (
    <div
      id="soc-alert-toast"
      style={{
        display: "none",
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 99999,
        background: "var(--panel)",
        border: "1px solid #e53935",
        borderRadius: "8px",
        padding: "16px 20px",
        boxShadow: "0 12px 35px rgba(229,57,53,0.35)",
        maxWidth: "400px",
        animation: "slideIn 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <strong style={{ color: "#e53935", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span id="soc-toast-title">Security Alert</span>
        </strong>
        <button
          type="button"
          onClick={handleClose}
          style={{ background: "transparent", border: "none", color: "var(--text-low)", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}
        >
          &times;
        </button>
      </div>
      <div id="soc-alert-msg" style={{ color: "var(--text-high)", fontSize: "13px", lineHeight: 1.5 }}>
        Checking network anomalies...
      </div>
    </div>
  );
}
