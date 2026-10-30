"use client";
import React from "react";

export default function HeroSection() {
  const handleLaunchSensorGrid = () => {
    if (typeof (window as any).safeScrollTo === "function") {
      (window as any).safeScrollTo("ingest", 850);
    } else {
      const el = document.getElementById("ingest");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 850, behavior: "smooth" });
    }
  };

  const handleLiveTelemetry = () => {
    const el = document.getElementById("preview");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 1550, behavior: "smooth" });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-stage">
        {/* Left Stage: Headline & Command Telemetry */}
        <div className="hero-left-stage">
          <div className="hero-eyebrow">
            <span className="beacon-dot" />
            <span>Cybersecurity Dashboard</span>
          </div>

          <h1 className="hero-award-title">
            Autonomous AI<br />Cyber Defense
          </h1>

          <p className="hero-award-desc">
            ZeroBreach AI continuously monitors network traffic to detect and stop cyber threats in real time. Powered by intelligent machine learning, it automatically catches unauthorized intrusions, suspicious activity, malware traffic, and emerging cyber attacks before they can cause harm.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn-cyber-laser"
              onClick={handleLaunchSensorGrid}
            >
              LAUNCH SENSOR GRID
            </button>
            <button
              type="button"
              className="btn-cyber-outline"
              onClick={handleLiveTelemetry}
            >
              LIVE TELEMETRY &rarr;
            </button>
          </div>

          <div className="hero-telemetry-strip">
            <div className="telem-badge">
              <span className="telem-k">STATUS</span>
              <span className="telem-v cyan" id="hero-telem-status">ACTIVE_GRID</span>
            </div>
            <div className="telem-badge">
              <span className="telem-k">LATENCY</span>
              <span className="telem-v cyan" id="hero-telem-latency">12.4ms</span>
            </div>
            <div className="telem-badge">
              <span className="telem-k">FLOWS</span>
              <span className="telem-v purple" id="hero-telem-flows">2.8M+</span>
            </div>
            <div className="telem-badge">
              <span className="telem-k">ACCURACY</span>
              <span className="telem-v gold" id="hero-telem-accuracy">99.93%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Scroll Cue at bottom center */}
      <div
        className="hero-bottom-cue"
        onClick={handleLaunchSensorGrid}
        style={{ cursor: "pointer" }}
      >
        <div className="mouse-icon">
          <div className="mouse-wheel-dot" />
        </div>
        <div className="scroll-cue-text">Scroll to explore dashboard &amp; telemetry</div>
      </div>
    </section>
  );
}
