"use client";
import React from "react";

export default function DocModal() {
  const handleClose = () => {
    const el = document.getElementById("doc-modal");
    if (el) el.style.display = "none";
  };

  return (
    <div
      id="doc-modal"
      style={{
        display: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.8)",
        zIndex: 1000,
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "8px",
          width: "600px",
          maxWidth: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "32px",
          position: "relative",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: "var(--text-low)",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          &times;
        </button>
        <h2
          id="doc-title"
          style={{
            fontFamily: "var(--disp)",
            fontSize: "22px",
            marginBottom: "16px",
            color: "var(--signal)",
          }}
        >
          Documentation
        </h2>
        <div
          id="doc-content"
          style={{ color: "var(--text-high)", fontSize: "14px", lineHeight: 1.6 }}
        >
          {/* Content injected via JS */}
        </div>
      </div>
    </div>
  );
}
