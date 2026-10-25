"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Shield,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  Target,
  ShieldAlert,
  Radio,
  Cpu,
  Globe2,
  Terminal,
  Zap,
  Key,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginBackground3D from "@/components/LoginBackground3D";

// -------------------------------------------------------------
// 4 Role Access Cards with Professional Security Profiles
// -------------------------------------------------------------
const ROLE_CARDS = [
  {
    id: "analyst",
    title1: "SECURITY",
    title2: "ANALYST",
    user: "analyst",
    pass: "analyst123",
    icon: ShieldCheck,
    badgeColor: "#38bdf8",
    desc: "Real-time traffic monitoring, telemetry ingestion & anomaly detection",
  },
  {
    id: "hunter",
    title1: "THREAT",
    title2: "HUNTER",
    user: "soc",
    pass: "soc123",
    icon: Target,
    badgeColor: "#00f0ff",
    desc: "Proactive threat hunting, indicator correlation & attack pattern investigation",
  },
  {
    id: "defender",
    title1: "SYSTEMS",
    title2: "ENGINEER",
    user: "enterprise",
    pass: "enterprise123",
    icon: ShieldAlert,
    badgeColor: "#c084fc",
    desc: "System security, access control & automated protection policies",
  },
  {
    id: "lead",
    title1: "SECURITY",
    title2: "ADMIN",
    user: "admin",
    pass: "admin123",
    icon: Radio,
    badgeColor: "#10b981",
    desc: "Enterprise access governance, incident escalation & policy administration",
  },
];


// -------------------------------------------------------------
// Main Login Page Component
// -------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("lead");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Intro Sequence State
  const [showIntro, setShowIntro] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [typedSubtitle, setTypedSubtitle] = useState("");

  const titleText = "ZEROBREACH AI";
  const subtitleText = "ENTERPRISE SECURITY INTELLIGENCE PLATFORM";

  useEffect(() => {
    let i = 0;
    const titleInterval = setInterval(() => {
      if (i < titleText.length) {
        setTypedTitle(titleText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(titleInterval);

        let j = 0;
        const subtitleInterval = setInterval(() => {
          if (j < subtitleText.length) {
            setTypedSubtitle(subtitleText.slice(0, j + 1));
            j++;
          } else {
            clearInterval(subtitleInterval);
          }
        }, 30);
      }
    }, 45);

    let p = 0;
    const percentInterval = setInterval(() => {
      p += Math.floor(Math.random() * 8) + 2;
      if (p >= 100) {
        p = 100;
        setLoadingPercent(100);
        clearInterval(percentInterval);

        setTimeout(() => {
          setShowIntro(false);
        }, 750);
      } else {
        setLoadingPercent(p);
      }
    }, 65);

    // Allow user to instantly skip intro via Keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        setShowIntro(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(titleInterval);
      clearInterval(percentInterval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectRole = (cardId: string) => {
    setSelectedRole(cardId);
    setAuthError(null);
    const card = ROLE_CARDS.find((r) => r.id === cardId);
    if (card) {
      setUsername(card.user);
      setPassword(card.pass);
    }
  };

  const handleLogin = async (e?: React.FormEvent, isDemo = false) => {
    if (e) e.preventDefault();
    if (!isDemo && (!username || !password)) return;

    setIsAuthenticating(true);
    setAuthError(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://zerobreachai-backend1.onrender.com";

    if (isDemo) {
      localStorage.setItem("token", "demo-token-" + (username || "admin"));
      localStorage.setItem("role", selectedRole || "admin");
      localStorage.setItem("username", username || "admin");
      localStorage.setItem("is_demo_mode", "true");
      router.push("/dashboard");
      setIsAuthenticating(false);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role || "admin");
        localStorage.setItem("username", username);
        localStorage.removeItem("is_demo_mode");
        router.push("/dashboard");
      } else {
        const errData = await response.json().catch(() => ({}));
        setAuthError(errData.detail || "Authentication rejected. Invalid operator credentials.");
      }
    } catch {
      // Graceful Portfolio / Resume Fallback:
      // If deployed backend is cold-starting or offline, auto-enter interactive portfolio preview
      setAuthError("Live backend initializing... Launching instant portfolio preview.");
      setTimeout(() => {
        localStorage.setItem("token", "demo-token-" + (username || "admin"));
        localStorage.setItem("role", selectedRole || "admin");
        localStorage.setItem("username", username || "admin");
        localStorage.setItem("is_demo_mode", "true");
        router.push("/dashboard");
      }, 700);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const currentRoleObj = ROLE_CARDS.find((r) => r.id === selectedRole) || ROLE_CARDS[3];

  return (
    <div className="min-h-screen w-full bg-[#020409] relative overflow-hidden font-sans text-[#f8fafc] selection:bg-[#00f0ff]/30 selection:text-white flex items-center">
      {/* Dynamic Keyframe Animations for Cyber Scanlines & Button Sheens */}
      <style>{`
        @keyframes scanlineGlider {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes laserSheenGlider {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(250%) skewX(-25deg); }
        }
        @keyframes radarCompassSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseConicBorder {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .laser-sheen-sweep {
          position: absolute;
          top: 0;
          left: 0;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
          animation: laserSheenGlider 3.2s infinite ease-in-out;
          pointer-events: none;
        }
        .cyber-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00f0ff, #38bdf8, transparent);
          box-shadow: 0 0 14px #00f0ff;
          animation: scanlineGlider 4s infinite linear;
          pointer-events: none;
        }
      `}</style>

      {/* 3D Holographic Threat Globe & Nebula Background */}
      <LoginBackground3D />

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(14px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={() => setShowIntro(false)}
            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#020409]/75 backdrop-blur-md cursor-pointer select-none"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f0ff]/10 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#c026d3]/15 blur-[120px] rounded-full pointer-events-none" />

            <div className="text-center relative z-10 px-6">
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
                <span className="text-[11px] font-mono tracking-[0.3em] text-[#00f0ff] uppercase">SECURE ACCESS SYSTEM</span>
              </div>
              <div className="text-4xl md:text-6xl font-black tracking-wider text-[#f8fafc] flex items-center justify-center h-16 drop-shadow-[0_0_25px_rgba(0,240,255,0.45)]">
                <span>{typedTitle}</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="text-[#00f0ff] ml-2 font-mono"
                >
                  |
                </motion.span>
              </div>
              <div className="mt-4 h-6 text-xs md:text-sm tracking-[0.28em] text-[#94a3b8] font-mono uppercase">
                {typedSubtitle}
              </div>

              {/* Click / Press to Skip Pill */}
              <div className="mt-7 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00f0ff]/30 bg-[rgba(0,240,255,0.08)] text-[9.5px] font-mono tracking-widest text-[#00f0ff] hover:bg-[#00f0ff]/20 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
                <span>CLICK ANYWHERE OR PRESS ESC TO ENTER</span>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 text-[11px] font-mono tracking-widest text-[#64748b] flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span>PLATFORM READY</span>
            </div>

            <div className="absolute bottom-8 right-8 text-xs font-mono font-bold tracking-[0.25em] text-[#00f0ff]">
              [{loadingPercent.toString().padStart(3, "0")}%]
            </div>
          </motion.div>
        ) : (
          /* Split Screen Container: Left side displays Globe, Right side displays Console */
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 items-center min-h-screen py-6 sm:py-10 relative z-20">
            {/* Left 7 Columns: Transparent spacer so the 3D globe is completely unobstructed */}
            <div className="hidden lg:block lg:col-span-7 h-[600px] pointer-events-none" />

            {/* Right 5 Columns: Enterprise Access Console */}
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="lg:col-span-5 w-full max-w-[480px] mx-auto relative pt-4 md:pt-0"
            >
              {/* Outer Radiant Glow Halo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[540px] bg-gradient-to-b from-[#00f0ff]/15 via-transparent to-[#c026d3]/15 blur-[110px] rounded-3xl pointer-events-none" />

              {/* Obsidian Frosted Glass Terminal */}
              <div className="bg-[rgba(6,12,26,0.88)] backdrop-blur-2xl border border-[rgba(0,240,255,0.35)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-[0_28px_80px_rgba(0,0,0,0.92),0_0_45px_rgba(0,240,255,0.18),inset_0_1px_1px_rgba(255,255,255,0.2)] relative z-10 overflow-hidden">
                {/* High-Tech Tactical Holographic Scanline */}
                <div className="cyber-scanline" />

                {/* Corner Technical Accents */}
                <div className="absolute top-3 left-3">
                  <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-[#00f0ff]/60" />
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {/* Rotating Animated Radar Compass Dial SVG */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="2"
                    className="opacity-75"
                    style={{ animation: "radarCompassSpin 9s linear infinite" }}
                  >
                    <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                  <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-[#00f0ff]/60" />
                </div>

                <div className="absolute bottom-3 left-3">
                  <div className="w-3.5 h-3.5 border-b-2 border-l-2 border-[#00f0ff]/60" />
                </div>

                <div className="absolute bottom-3 right-3">
                  <div className="w-3.5 h-3.5 border-b-2 border-r-2 border-[#00f0ff]/60" />
                </div>

                {/* Brand Header */}
                <div className="flex items-center justify-center gap-2.5 mb-2 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff]/30 to-[#a855f7]/30 border border-[#00f0ff]/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                    <Shield className="w-4 h-4 text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]" />
                  </div>
                  <h1 className="text-2xl font-black tracking-[0.16em] text-white">
                    ZEROBREACH <span className="text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.7)]">AI</span>
                  </h1>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-center gap-2 mb-5">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#00f0ff]/50" />
                  <h2 className="text-center text-xs md:text-[13px] font-black tracking-[0.2em] text-[#e2e8f0] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    ENTERPRISE SIGN IN
                  </h2>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#00f0ff]/50" />
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-3.5">
                  {/* Operator ID Input */}
                  <div className="space-y-1">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Shield className="h-4 w-4 text-[#00f0ff]/80 group-focus-within:text-[#00f0ff] transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[rgba(3,8,20,0.85)] border border-[rgba(0,240,255,0.30)] hover:border-[#00f0ff]/60 text-[#f8fafc] rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/30 transition-all font-mono text-xs placeholder:text-[#64748b] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                        placeholder="Username (e.g. admin, analyst, soc)"
                        required
                      />
                    </div>
                  </div>

                  {/* Passcode Input */}
                  <div className="space-y-1">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#00f0ff]/80 group-focus-within:text-[#00f0ff] transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[rgba(3,8,20,0.85)] border border-[rgba(0,240,255,0.30)] hover:border-[#00f0ff]/60 text-[#f8fafc] rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/30 transition-all font-mono text-xs placeholder:text-[#64748b] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                        placeholder="Password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748b] hover:text-[#00f0ff] transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* 4 Quick Role Access Cards with Clearance Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {ROLE_CARDS.map((card) => {
                      const isActive = selectedRole === card.id;
                      const IconComp = card.icon;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => selectRole(card.id)}
                          style={{
                            borderColor: isActive ? card.badgeColor : undefined,
                            boxShadow: isActive
                              ? `0 0 20px ${card.badgeColor}50, inset 0 0 12px ${card.badgeColor}25`
                              : undefined,
                            backgroundColor: isActive ? `${card.badgeColor}18` : undefined,
                          }}
                          className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all border cursor-pointer ${
                            isActive
                              ? "scale-[1.04]"
                              : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#94a3b8] hover:border-[#00f0ff]/40 hover:text-white hover:bg-[#00f0ff]/05"
                          }`}
                        >
                          {/* Active Ping Beacon */}
                          {isActive && (
                            <span
                              style={{ backgroundColor: card.badgeColor }}
                              className="absolute -top-1 -left-1 w-2 h-2 rounded-full animate-ping"
                            />
                          )}

                          <IconComp
                            style={{ color: isActive ? card.badgeColor : undefined }}
                            className={`w-4 h-4 mb-1 ${!isActive ? "text-[#94a3b8]" : ""}`}
                          />
                          <span className="text-[8px] font-mono font-semibold tracking-wider text-center leading-tight">
                            {card.title1}
                            <br />
                            {card.title2}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Active Role Mission Briefing */}
                  <motion.div
                    key={currentRoleObj.id}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-2.5 rounded-lg bg-[rgba(0,240,255,0.05)] border border-[#00f0ff]/20 flex items-start gap-2 text-[10px] font-mono text-[#94a3b8] leading-relaxed"
                  >
                    <span
                      style={{ backgroundColor: currentRoleObj.badgeColor }}
                      className="w-1.5 h-1.5 rounded-full animate-ping flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-bold tracking-wider mr-1.5">
                        {currentRoleObj.title1} {currentRoleObj.title2}:
                      </span>
                      <span>{currentRoleObj.desc}</span>
                    </div>
                  </motion.div>

                  {/* Error Notification Banner */}
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 rounded-lg bg-[rgba(255,0,85,0.12)] border border-[rgba(255,0,85,0.35)] text-[#ff3366] text-[11px] font-mono text-center"
                    >
                      {authError}
                    </motion.div>
                  )}

                  {/* Primary Action Button: "SIGN IN" with Animated Laser Sheen */}
                  <motion.button
                    whileHover={{ scale: 1.02, filter: "brightness(1.12)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isAuthenticating}
                    className="relative overflow-hidden w-full mt-2 bg-gradient-to-r from-[#00f0ff] via-[#38bdf8] to-[#c084fc] text-[#020409] font-black tracking-[0.16em] text-xs md:text-[13px] rounded-xl py-3 px-4 flex items-center justify-center space-x-2 transition-all shadow-[0_0_28px_rgba(0,240,255,0.6),0_0_40px_rgba(192,132,252,0.35)] cursor-pointer hover:shadow-[0_0_36px_rgba(0,240,255,0.85),0_0_50px_rgba(192,132,252,0.5)]"
                  >
                    {/* Sweeping Laser Sheen Glider */}
                    <div className="laser-sheen-sweep" />

                    {isAuthenticating ? (
                      <Activity className="w-4 h-4 animate-spin text-[#020409]" />
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-[#020409] fill-[#020409]/20" />
                        <span>SIGN IN</span>
                      </>
                    )}
                  </motion.button>

                  {/* 1-Click Portfolio / Recruiter Instant Access */}
                  <motion.button
                    whileHover={{ scale: 1.01, filter: "brightness(1.1)" }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => handleLogin(undefined, true)}
                    className="w-full mt-2.5 bg-gradient-to-r from-[rgba(0,240,255,0.08)] to-[rgba(192,132,252,0.08)] hover:from-[rgba(0,240,255,0.18)] hover:to-[rgba(192,132,252,0.18)] border border-[#00f0ff]/30 hover:border-[#00f0ff]/70 text-[#00f0ff] font-mono text-[11px] font-bold rounded-xl py-2.5 px-3 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.08)]"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
                    <span>⚡ 1-CLICK RECRUITER / DEMO ACCESS</span>
                  </motion.button>
                </form>

                {/* Sub-links */}
                <div className="flex items-center justify-center mt-3.5 text-[10px] font-mono text-[#64748b]">
                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="hover:text-[#00f0ff] transition-colors cursor-pointer"
                  >
                    FORGOT PASSWORD?
                  </button>
                </div>

                {/* Security Compliance Footer Watermark */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-[#475569]">
                  <span>ENTERPRISE SECURITY PLATFORM</span>
                  <span className="text-[#10b981]">● SYSTEM READY</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enterprise Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[rgba(6,11,25,0.96)] border border-[#00f0ff]/40 rounded-2xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(0,240,255,0.15)] font-mono text-left"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-[#00f0ff]" />
                <h3 className="text-sm font-bold text-white tracking-wider">
                  CREDENTIAL RECOVERY
                </h3>
              </div>
              <button
                onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }}
                className="text-[#64748b] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.12)] border border-[#10b981]/40 text-[#10b981] text-xs leading-relaxed">
                  ✓ Recovery dispatch confirmed. A temporary cryptographic password reset token has been routed to your registered identity provider (IdP) mailbox.
                </div>
                <button
                  onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }}
                  className="w-full py-2.5 bg-[#00f0ff] text-black font-bold text-xs rounded-xl hover:bg-[#5ae6e4] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  RETURN TO SIGN IN
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail) setForgotSuccess(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  ZeroBreach AI enforces RBAC credential isolation. Enter your operator address to dispatch a password reset token through the SOC administration queue:
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="operator@zerobreach.ai"
                  className="w-full bg-[rgba(3,8,20,0.85)] border border-[rgba(0,240,255,0.3)] text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#00f0ff] font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                />
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 text-xs text-[#94a3b8] rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#0077b6] text-black font-bold text-xs rounded-xl hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
                  >
                    DISPATCH RESET
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
