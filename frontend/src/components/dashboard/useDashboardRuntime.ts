"use client";
import { useEffect } from "react";

export function useDashboardRuntime() {
  useEffect(() => {
    // Dynamic Navigation Scrollspy
    const handleScrollspy = () => {
      const popover = document.getElementById("notifications-popover");
      if (popover && popover.style.display === "block") {
        setActiveTab("nav-alerts");
        return;
      }
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const vh = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // 1. If at top of page, always highlight Dashboard
      if (scrollY < 120) {
        setActiveTab("nav-dashboard");
        return;
      }

      // 2. If reached bottom of document -> Support
      if (scrollY + vh >= docHeight - 40) {
        setActiveTab("nav-support");
        return;
      }

      const getTop = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return rect.top + (window.scrollY || document.documentElement.scrollTop);
      };

      const sections = [
        { navId: "nav-support", id: "support" },
        { navId: "nav-support", id: "admin-tickets" },
        { navId: "nav-reports", id: "reports" },
        { navId: "nav-intel", id: "threat-intel-analytics" },
        { navId: "nav-intel", id: "modules" },
        { navId: "nav-monitor", id: "preview" },
        { navId: "nav-monitor", id: "ingest" },
        { navId: "nav-dashboard", id: "hero" },
      ];

      for (const sec of sections) {
        const top = getTop(sec.id);
        if (top !== null && scrollY >= top - 220) {
          setActiveTab(sec.navId);
          return;
        }
      }

      setActiveTab("nav-dashboard");
    };

    const setActiveTab = (activeId: string) => {
      const navIds = [
        "nav-dashboard",
        "nav-monitor",
        "nav-alerts",
        "nav-intel",
        "nav-reports",
        "nav-support",
      ];
      navIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === activeId) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
    };

    (window as any).setActiveNav = setActiveTab;
    (window as any).safeScrollTo = (id: string, fallbackOffset = 0) => {
      const target = document.getElementById(id);
      if (target) {
        const yOffset = -70;
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else {
        window.scrollTo({ top: fallbackOffset, behavior: "smooth" });
      }
    };

    window.addEventListener("scroll", handleScrollspy, { passive: true });
    window.addEventListener("resize", handleScrollspy, { passive: true });
    const scrollTimer = setTimeout(handleScrollspy, 100);

    const executeRuntimeScript = () => {
      if (typeof window !== "undefined") {
        (window as any).__API_BASE__ =
          process.env.NEXT_PUBLIC_API_URL ||
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://127.0.0.1:8000"
            : "");
      }
      if (typeof (window as any).__ZB_CLEANUP_3D__ === "function") {
        (window as any).__ZB_CLEANUP_3D__();
      }
      const existingLogic = document.getElementById("landing-logic");
      if (existingLogic && document.body.contains(existingLogic)) {
        document.body.removeChild(existingLogic);
      }

      const logicScript = document.createElement("script");
      logicScript.id = "landing-logic";
      logicScript.src = "/scripts/dashboard-runtime.js";
      logicScript.async = false;
      document.body.appendChild(logicScript);
    };

    // Ensure Three.js is initialized before launching runtime scripts
    if ((window as any).THREE) {
      executeRuntimeScript();
    } else {
      import("three")
        .then((THREE) => {
          (window as any).THREE = THREE;
          executeRuntimeScript();
        })
        .catch((err) => {
          console.error("Failed to load Three.js from npm, falling back to CDN:", err);
          let script = document.getElementById("three-cdn-script") as HTMLScriptElement | null;
          if (!script) {
            script = document.createElement("script");
            script.id = "three-cdn-script";
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
            script.async = true;
            script.onload = executeRuntimeScript;
            document.head.appendChild(script);
          } else {
            script.addEventListener("load", executeRuntimeScript);
          }
        });
    }

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener("scroll", handleScrollspy);
      window.removeEventListener("resize", handleScrollspy);
      if (typeof (window as any).__ZB_CLEANUP_3D__ === "function") {
        (window as any).__ZB_CLEANUP_3D__();
      }
      const logicEl = document.getElementById("landing-logic");
      if (logicEl && document.body.contains(logicEl)) {
        document.body.removeChild(logicEl);
      }
    };
  }, []);
}
