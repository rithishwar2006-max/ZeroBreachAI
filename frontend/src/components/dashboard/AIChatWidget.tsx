"use client";
import React from "react";

export default function AIChatWidget() {
  const handleToggleChat = () => {
    if (typeof (window as any).toggleChat === "function") {
      (window as any).toggleChat();
    }
  };

  const handleSendMessage = () => {
    if (typeof (window as any).sendChatMessage === "function") {
      (window as any).sendChatMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div id="ai-chat-widget" style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}>
      {/* Chat Icon Button */}
      <button
        type="button"
        id="chat-toggle"
        onClick={handleToggleChat}
        style={{
          background: "var(--signal)",
          color: "#0a0e16",
          border: "none",
          borderRadius: "50%",
          width: "56px",
          height: "56px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "transform 0.2s",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat Window */}
      <div
        id="chat-window"
        style={{
          display: "none",
          position: "absolute",
          bottom: "70px",
          right: 0,
          width: "320px",
          maxWidth: "calc(100vw - 32px)",
          height: "400px",
          maxHeight: "75vh",
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            padding: "12px 16px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: "14px",
              color: "var(--signal)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            ZeroBreach AI Assistant
          </h4>
          <button
            type="button"
            onClick={handleToggleChat}
            style={{ background: "transparent", border: "none", color: "var(--text-low)", cursor: "pointer" }}
          >
            &times;
          </button>
        </div>

        {/* Messages Area */}
        <div
          id="chat-messages"
          style={{
            flex: 1,
            padding: "16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              background: "rgba(43, 212, 173, 0.1)",
              border: "1px solid rgba(43, 212, 173, 0.2)",
              padding: "10px",
              borderRadius: "6px",
              color: "var(--text-high)",
              alignSelf: "flex-start",
              maxWidth: "85%",
            }}
          >
            Hello! I am the ZeroBreach AI Assistant. I can help you understand risk scores, navigate the dashboard, or tune the ML baseline. How can I help?
          </div>
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid var(--line)",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="text"
            id="chat-input"
            placeholder="Type a question..."
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              padding: "8px 12px",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid var(--line)",
              color: "#fff",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            style={{
              background: "var(--signal)",
              color: "#0a0e16",
              border: "none",
              borderRadius: "4px",
              padding: "0 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
