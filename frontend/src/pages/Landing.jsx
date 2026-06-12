import { useState } from "react";
import { Link } from "react-router-dom";

/* ─── Design tokens ────────────────────────────────────────────────────── */
const C = {
  primary:  "#4F46E5",
  primaryD: "#4338CA",
  bg:       "#F8FAFC",
  surface:  "#FFFFFF",
  border:   "#E2E8F0",
  text:     "#1E293B",
  muted:    "#64748B",
  shadow:   "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
};

const features = [
  { icon: "📷", title: "Face Monitoring",    desc: "Real-time webcam analysis ensures only the registered student is present." },
  { icon: "🔍", title: "Cheating Detection", desc: "MediaPipe AI flags multiple faces and unexpected objects instantly." },
  { icon: "🤖", title: "AI Alerts",          desc: "Violations are automatically logged and escalated with AI summaries." },
  { icon: "📊", title: "Exam Reports",       desc: "Admins get detailed per-student risk scores and violation timelines." },
];

const Landing = () => {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 60%, #E0F2FE 100%)`,
        padding: "80px 24px 72px",
        textAlign: "center",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ fontSize: "56px", marginBottom: "16px", lineHeight: 1 }}>🛡️</div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, color: C.text, letterSpacing: "-0.03em", marginBottom: "16px" }}>
          Exam Proctor AI
        </h1>
        <p style={{ fontSize: "18px", color: C.muted, maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.6 }}>
          AI-powered exam integrity monitoring — keeping assessments fair, transparent, and secure.
        </p>

        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          {/* Primary filled */}
          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              borderRadius: "8px",
              backgroundColor: hoveredBtn === "student" ? C.primaryD : C.primary,
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              transition: "background 0.18s",
            }}
            onMouseEnter={() => setHoveredBtn("student")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            🎓 Student Login
          </Link>

          {/* Secondary outlined */}
          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              borderRadius: "8px",
              border: `2px solid ${C.primary}`,
              backgroundColor: hoveredBtn === "admin" ? "#EEF2FF" : C.surface,
              color: C.primary,
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              transition: "background 0.18s",
            }}
            onMouseEnter={() => setHoveredBtn("admin")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            🔐 Admin Login
          </Link>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: "28px", fontWeight: 700, marginBottom: "8px", color: C.text }}>
          Everything you need for secure exams
        </h2>
        <p style={{ textAlign: "center", color: C.muted, marginBottom: "48px", fontSize: "15px" }}>
          Powered by MediaPipe and AI — running right in the browser.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={i * 80} />
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}`, textAlign: "center", padding: "24px", color: C.muted, fontSize: "13px" }}>
        © {new Date().getFullYear()} Exam Proctor AI. All rights reserved.
      </div>
    </div>
  );
};

const FeatureCard = ({ feature, delay }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        backgroundColor: hovered ? "#F5F3FF" : "#FFFFFF",
        border: `1px solid ${hovered ? "#C7D2FE" : "#E2E8F0"}`,
        borderRadius: "12px",
        padding: "28px 24px",
        boxShadow: hovered
          ? "0 4px 16px rgba(79,70,229,0.12)"
          : "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        animation: `fadeUp 0.4s ease ${delay}ms both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>{feature.icon}</div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#1E293B" }}>
        {feature.title}
      </h3>
      <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6 }}>{feature.desc}</p>
    </div>
  );
};

export default Landing;