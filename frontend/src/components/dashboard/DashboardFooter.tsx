"use client";
import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="reveal">
      <div className="wrap" style={{ display: "flex", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: "12px" }}>
        <span>ZeroBreach AI, network anomaly detection and threat monitoring.</span>
        <span className="fmono">Built with FastAPI, Dual-Model Ensemble (RF + XGBoost), and MongoDB.</span>
      </div>
    </footer>
  );
}
