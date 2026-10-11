"use client";
import React from "react";

export default function TicketsSection() {
  const handleFetchTickets = () => {
    if (typeof (window as any).fetchTickets === "function") {
      (window as any).fetchTickets();
    }
  };

  const handleClearTickets = () => {
    if (typeof (window as any).clearTickets === "function") {
      (window as any).clearTickets();
    }
  };

  const handleSubmitTicket = () => {
    if (typeof (window as any).submitTicket === "function") {
      (window as any).submitTicket();
    }
  };

  const handleOpenDoc = (title: string, content: string) => {
    if (typeof (window as any).openDoc === "function") {
      (window as any).openDoc(title, content);
    }
  };

  return (
    <>
      {/* Admin Support Tickets Queue */}
      <section
        id="admin-tickets"
        className="panel reveal"
        style={{
          padding: "40px 32px",
          maxWidth: "1180px",
          margin: "0 auto 40px auto",
          borderTop: "1px solid var(--line)",
          display: "none",
        }}
      >
        <div className="sec-head" style={{ paddingTop: 0 }}>
          <h2 style={{ fontFamily: "var(--disp)", fontSize: "24px", marginBottom: "20px" }}>
            Admin: Support Tickets
          </h2>
          <p style={{ color: "var(--text-low)", marginBottom: "20px" }}>
            Review and resolve support tickets submitted by users.
          </p>
        </div>
        <div style={{ marginBottom: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleFetchTickets}
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh Tickets
          </button>
          <button
            type="button"
            onClick={handleClearTickets}
            className="btn btn-secondary"
            style={{
              fontSize: "12px",
              padding: "8px 16px",
              borderColor: "rgba(239,68,68,0.4)",
              color: "#ef4444",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Clear Tickets
          </button>
        </div>
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead style={{ background: "rgba(0,0,0,0.2)" }}>
              <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--text-low)" }}>
                <th style={{ padding: "16px" }}>Date</th>
                <th style={{ padding: "16px" }}>User</th>
                <th style={{ padding: "16px" }}>Role</th>
                <th style={{ padding: "16px" }}>Subject</th>
                <th style={{ padding: "16px" }}>Description</th>
                <th style={{ padding: "16px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody id="tickets-table-body">
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--text-low)" }}>
                  Click refresh to load tickets.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SOC Analyst Support & Documentation */}
      <section
        id="support"
        style={{
          padding: "40px 32px 80px",
          maxWidth: "1180px",
          margin: "0 auto",
          borderTop: "1px solid var(--line)",
        }}
      >
        <h2 style={{ fontFamily: "var(--disp)", fontSize: "24px", marginBottom: "20px" }}>
          SOC Analyst Support
        </h2>
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <div id="ticket-form-container">
            <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "var(--signal)" }}>
              Open a Ticket
            </h3>
            <input
              type="text"
              id="ticket-subject"
              placeholder="Issue Subject"
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--line)",
                color: "#fff",
                borderRadius: "4px",
                marginBottom: "12px",
              }}
            />
            <textarea
              id="ticket-desc"
              placeholder="Describe the anomaly or system issue..."
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--line)",
                color: "#fff",
                borderRadius: "4px",
                height: "80px",
                marginBottom: "12px",
              }}
            />
            <button
              type="button"
              onClick={handleSubmitTicket}
              className="btn btn-secondary"
            >
              Submit Ticket
            </button>
          </div>
          <div>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "var(--signal)" }}>
              Documentation
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "var(--text-low)", fontSize: "14px", lineHeight: 2 }}>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDoc(
                      "ML Model Baseline Tuning",
                      "The ML Baseline Tuning utilizes a Dual-Model Ensemble (Random Forest + XGBoost) trained on the CIC-IDS2017 dataset with Champion-Challenger dynamic confidence arbitration. To tune the baseline for your specific enterprise, navigate to the Settings tab and adjust the Risk Threshold slider."
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, margin: 0, color: "var(--signal)", cursor: "pointer", font: "inherit", fontSize: "14px", textAlign: "left" }}
                >
                  &gt; ML Model Baseline Tuning
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDoc(
                      "How to read PCAP uploads",
                      "To read PCAP files, ZeroBreach AI uses CICFlowMeter on the backend to extract 80+ network traffic features. You can upload any standard libpcap or tcpdump capture file directly in the Ingest tab. Ensure your PCAP does not exceed the 200MB limit per upload batch."
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, margin: 0, color: "var(--signal)", cursor: "pointer", font: "inherit", fontSize: "14px", textAlign: "left" }}
                >
                  &gt; How to read PCAP uploads
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDoc(
                      "Exporting Data to SIEM",
                      "ZeroBreach AI natively supports exporting traffic logs and threat alerts to external SIEMs like Splunk, QRadar, and Elasticsearch. You can either use the Export Full CSV button for manual imports, or configure a webhook in the Settings panel to stream alerts via HTTPS POST requests in standard JSON format."
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, margin: 0, color: "var(--signal)", cursor: "pointer", font: "inherit", fontSize: "14px", textAlign: "left" }}
                >
                  &gt; Exporting Data to SIEM
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDoc(
                      "Understanding Risk Scores",
                      "Risk scores range from 0 to 100. A score below 30 is considered benign. Scores between 30 and 70 are suspicious and require Analyst review. Scores above 70 indicate an active, confirmed attack (e.g., DDoS, Brute Force, SQLi) and will trigger an immediate high-severity alert."
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, margin: 0, color: "var(--signal)", cursor: "pointer", font: "inherit", fontSize: "14px", textAlign: "left" }}
                >
                  &gt; Understanding Risk Scores
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDoc(
                      "Dual-Model Ensemble & Risk Scoring Math",
                      "ZeroBreach AI implements Dynamic Confidence Maximization (Champion-Challenger Arbitration) across two distinct tree-based architectures: a 100-estimator Random Forest (Primary Champion) and an XGBoost gradient-boosted ensemble (Secondary Challenger). Both models ingest identical 81 CICIDS2017 statistical flow features. For each flow, the engine computes peak class confidence: C = max(C_RF, C_XGB). The winning model is selected and its confidence C is fed into the composite risk formula: Risk = (W_conf * C * 100) + (W_sev * S * 100) + (W_asset * A * 100), weighted at W_conf = 0.50, W_sev = 0.30, and W_asset = 0.20. Disagreements between the two models are flagged for SOC analyst review."
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, margin: 0, color: "var(--signal)", cursor: "pointer", font: "inherit", fontSize: "14px", textAlign: "left" }}
                >
                  &gt; Dual-Model Ensemble &amp; Risk Scoring Math
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDoc(
                      "Resetting User Passwords & Authentication Governance",
                      "In production environments, ZeroBreach AI integrates with enterprise IdP/SSO (SAML 2.0 / OIDC) and local accounts are secure-hashed using salted bcrypt with zero plaintext storage. For academic demonstration environments, pre-seeded evaluator role profiles are provided on the login gateway to facilitate rapid testing of role-based access control."
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, margin: 0, color: "var(--signal)", cursor: "pointer", font: "inherit", fontSize: "14px", textAlign: "left" }}
                >
                  &gt; Resetting User Passwords &amp; Authentication Governance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDoc(
                      "Data & Storage Layer Architecture",
                      "ZeroBreach AI implements a hybrid database storage pattern: SQLAlchemy (PostgreSQL / SQLite) handles ACID transactions for User Accounts and Support Tickets. MongoDB serves as the high-throughput Application Database storing millions of 80+ feature PCAP telemetry flows. Model weights are persisted in dedicated artifact storage."
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, margin: 0, color: "var(--signal)", cursor: "pointer", font: "inherit", fontSize: "14px", textAlign: "left" }}
                >
                  &gt; Data &amp; Storage Layer Architecture
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDoc(
                      "Infrastructure & Deployment Blueprint",
                      "ZeroBreach AI is architected for microservice containerization using Docker and Kubernetes. Ingress traffic is shielded by JWT token verification and WAF rate-limiting. Real-time telemetry is continuously audited by host monitoring probes and disaster recovery snapshots."
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, margin: 0, color: "var(--signal)", cursor: "pointer", font: "inherit", fontSize: "14px", textAlign: "left" }}
                >
                  &gt; Infrastructure &amp; Deployment Blueprint
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDoc(
                      "API Rate Limits & Security Rules",
                      "API Rate Limits are currently enforced at 100 requests per minute per SOC Analyst token. Security Rules require a Bearer JWT to be passed in the Authorization header. Enterprise roles are strictly restricted to read-only dashboard access."
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, margin: 0, color: "var(--signal)", cursor: "pointer", font: "inherit", fontSize: "14px", textAlign: "left" }}
                >
                  &gt; API Rate Limits &amp; Security Rules
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
