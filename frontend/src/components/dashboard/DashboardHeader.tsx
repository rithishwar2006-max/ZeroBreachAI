"use client";
import React from "react";

export default function DashboardHeader() {
  const handleScrollTo = (id: string, offset: number, navId: string) => {
    if (typeof (window as any).safeScrollTo === "function") {
      (window as any).safeScrollTo(id, offset);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    if (typeof (window as any).setActiveNav === "function") {
      (window as any).setActiveNav(navId);
    }
  };

  const handleToggleNotifications = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof (window as any).toggleNotificationsPopover === "function") {
      (window as any).toggleNotificationsPopover(e.nativeEvent);
    }
  };

  const handleClearNotifications = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof (window as any).clearNotifications === "function") {
      (window as any).clearNotifications(e.nativeEvent);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <nav
        className="cyber-nav-bar"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "36px",
          padding: "12px 32px",
          maxWidth: "1200px",
          margin: "0 auto",
          fontFamily: "var(--body)",
        }}
      >
        <a
          id="nav-dashboard"
          href="#hero"
          className="nav-tab-link active"
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo("hero", 0, "nav-dashboard");
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Dashboard</span>
        </a>

        <a
          id="nav-monitor"
          href="#ingest"
          className="nav-tab-link"
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo("ingest", 850, "nav-monitor");
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span>Real-time Monitoring</span>
        </a>

        <div style={{ position: "relative", display: "inline-block" }}>
          <a
            id="nav-alerts"
            href="#"
            onClick={handleToggleNotifications}
            className="nav-tab-link"
          >
            <div style={{ position: "relative", display: "inline-flex" }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span
                id="alerts-icon-badge"
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-8px",
                  background: "#ff0055",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                  borderRadius: "10px",
                  minWidth: "16px",
                  height: "16px",
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  boxShadow: "0 0 8px rgba(255, 0, 85, 0.6)",
                }}
              >
                0
              </span>
            </div>
            <span>Alerts</span>
          </a>

          {/* Notifications Dropdown Popover */}
          <div
            id="notifications-popover"
            style={{
              display: "none",
              position: "absolute",
              top: "58px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "340px",
              maxWidth: "calc(100vw - 32px)",
              background: "rgba(8, 14, 28, 0.95)",
              border: "1px solid rgba(0, 200, 212, 0.3)",
              borderRadius: "10px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.85), 0 0 20px rgba(0,200,212,0.15)",
              zIndex: 100000,
              overflow: "hidden",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(0,0,0,0.3)",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong
                style={{
                  fontSize: "13px",
                  color: "var(--signal)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Security Notifications (<span id="notif-count-text">0</span>)
              </strong>
              <button
                type="button"
                onClick={handleClearNotifications}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-low)",
                  fontSize: "11px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Clear all
              </button>
            </div>
            <div
              id="notifications-list"
              style={{
                maxHeight: "320px",
                overflowY: "auto",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {/* Injected via JS */}
            </div>
          </div>
        </div>

        <a
          id="nav-intel"
          href="#threat-intel-analytics"
          className="nav-tab-link"
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo("threat-intel-analytics", 3200, "nav-intel");
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <span>Threat Intelligence</span>
        </a>

        <a
          id="nav-reports"
          href="#reports"
          className="nav-tab-link"
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo("reports", 4200, "nav-reports");
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Reports</span>
        </a>

        <a
          id="nav-support"
          href="#support"
          className="nav-tab-link"
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo("support", 5000, "nav-support");
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="8" cy="10" r="1" />
            <circle cx="12" cy="10" r="1" />
            <circle cx="16" cy="10" r="1" />
          </svg>
          <span>Support</span>
        </a>

        <button
          type="button"
          className="btn-cyber-logout"
          onClick={handleLogout}
          style={{
            alignSelf: "center",
            marginLeft: "auto",
            background: "rgba(255, 0, 85, 0.08)",
            border: "1px solid rgba(255, 0, 85, 0.4)",
            color: "#ff3366",
            fontWeight: 600,
            fontSize: "11.5px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderRadius: "6px",
            padding: "7px 16px",
            cursor: "pointer",
            transition: "all 0.25s",
            boxShadow: "0 0 12px rgba(255, 0, 85, 0.15)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,0,85,0.25)";
            e.currentTarget.style.borderColor = "#ff0055";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.boxShadow = "0 0 18px rgba(255,0,85,0.45)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,0,85,0.08)";
            e.currentTarget.style.borderColor = "rgba(255,0,85,0.4)";
            e.currentTarget.style.color = "#ff3366";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255,0,85,0.15)";
          }}
        >
          LOGOUT
        </button>
      </nav>
      <div className="scroll-progress" id="scroll-progress" />
    </header>
  );
}
