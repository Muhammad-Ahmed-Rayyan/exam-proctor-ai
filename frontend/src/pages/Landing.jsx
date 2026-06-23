import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Monitor, Bot } from "lucide-react";

import Logo from "../components/Logo";

const C = {
  navy:     "#0F172A",
  navyH:    "#1E293B",
  accent:   "#2563EB",
  accentH:  "#1D4ED8",
  bg:       "#F1F5F9",
  surface:  "#FFFFFF",
  border:   "#E2E8F0",
  text:     "#0F172A",
  muted:    "#1E293B",
};

const features = [
  {
    Icon: Shield,
    title: "Face Monitoring",
    desc:  "Real-time face detection ensures only the registered student remains on camera throughout the exam.",
  },
  {
    Icon: Monitor,
    title: "Tab Detection",
    desc:  "Any attempt to switch tabs or lose window focus is instantly flagged and logged as a violation.",
  },
  {
    Icon: Bot,
    title: "AI Reports",
    desc:  "Violations are summarised automatically by Groq LLaMA 3, giving admins clear integrity assessments.",
  },
];

const Landing = () => {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: "#0F172A",
        padding: "100px 24px 88px",
        textAlign: "center",
      }}>
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "center" }}>
          <Logo size="lg" dark={true} />
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 52px)",
          fontWeight: 800,
          color: "#FFFFFF",
          letterSpacing: "-0.03em",
          margin: "0 0 18px",
          lineHeight: 1.1,
        }}>
          AI-Powered Exam Integrity
        </h1>

        <p style={{
          fontSize: "18px",
          color: "#94A3B8",
          maxWidth: "500px",
          margin: "0 auto 44px",
          lineHeight: 1.65,
        }}>
          Real-time proctoring that keeps assessments fair, transparent, and secure.
        </p>

        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              borderRadius: "8px",
              backgroundColor: hoveredBtn === "signin" ? C.accentH : C.accent,
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              transition: "background 0.18s",
            }}
            onMouseEnter={() => setHoveredBtn("signin")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            Sign In
          </Link>

          <Link
            to="/register"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              borderRadius: "8px",
              border: "2px solid rgba(255,255,255,0.6)",
              backgroundColor: hoveredBtn === "register" ? "rgba(255,255,255,0.08)" : "transparent",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              transition: "background 0.18s",
            }}
            onMouseEnter={() => setHoveredBtn("register")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            Register
          </Link>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "26px",
          fontWeight: 800,
          marginBottom: "8px",
          color: C.text,
          letterSpacing: "-0.02em",
        }}>
          Everything you need for secure exams
        </h2>
        <p style={{ textAlign: "center", color: C.muted, marginBottom: "48px", fontSize: "15px" }}>
          Powered by face-api.js · Groq LLaMA 3 · FastAPI
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}>
          {features.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        textAlign: "center",
        padding: "24px",
        color: C.muted,
        fontSize: "13px",
      }}>
        © {new Date().getFullYear()} Exam Proctor AI. All rights reserved.
      </div>
    </div>
  );
};

const FeatureCard = ({ feature }) => {
  const [hovered, setHovered] = useState(false);
  const { Icon, title, desc } = feature;
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${hovered ? "#BFDBFE" : "#E2E8F0"}`,
        borderRadius: "12px",
        padding: "28px 24px",
        boxShadow: hovered
          ? "0 4px 16px rgba(37,99,235,0.10)"
          : "0 1px 3px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease",
        animation: "fadeUp 0.4s ease both",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        backgroundColor: hovered ? "#EFF6FF" : "#F1F5F9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px",
        transition: "background 0.2s",
      }}>
        <Icon size={20} color={hovered ? "#2563EB" : "#64748B"} />
      </div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#0F172A" }}>
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "#1E293B", lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
};

export default Landing;