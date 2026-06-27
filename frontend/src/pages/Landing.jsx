import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Monitor, Bot, CheckCircle } from "lucide-react";
import Logo from "../components/Logo";

const Landing = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "64px",
        backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0",
        padding: "0 48px", display: "flex", justifyContent: "space-between",
        alignItems: "center", zIndex: 100,
      }}>
        <Logo size="sm" />
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/login"
            onMouseEnter={() => setHovered("navSignIn")}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0",
              backgroundColor: hovered === "navSignIn" ? "#F1F5F9" : "#FFFFFF",
              color: "#0F172A", fontWeight: 600, fontSize: "14px",
              textDecoration: "none", transition: "background-color 0.15s",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
            Sign In
          </Link>
          <Link to="/register"
            onMouseEnter={() => setHovered("navGetStarted")}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "8px 16px", borderRadius: "8px",
              backgroundColor: hovered === "navGetStarted" ? "#1D4ED8" : "#2563EB",
              color: "#FFFFFF", fontWeight: 600, fontSize: "14px",
              textDecoration: "none", transition: "background-color 0.15s",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
            Get Started
          </Link>
        </div>
      </nav>

      <div style={{
        minHeight: "calc(100vh - 64px)", paddingTop: "144px", paddingBottom: "80px",
        paddingLeft: "24px", paddingRight: "24px", backgroundColor: "#FFFFFF",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", boxSizing: "border-box",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          backgroundColor: "#EFF6FF", color: "#2563EB", padding: "6px 14px",
          borderRadius: "999px", fontSize: "13px", fontWeight: 600, marginBottom: "24px",
        }}>
          <Shield size={14} />
          <span>AI-Powered Proctoring Platform</span>
        </div>

        <h1 style={{
          fontSize: "56px", fontWeight: 800, color: "#0F172A", lineHeight: 1.15,
          letterSpacing: "-0.03em", margin: "0 0 20px",
        }}>
          Exam Integrity,<br />
          <span style={{ color: "#2563EB" }}>Powered by AI</span>
        </h1>

        <p style={{
          fontSize: "18px", color: "#64748B", maxWidth: "560px",
          lineHeight: 1.7, margin: "0 0 40px",
        }}>
          Real-time face monitoring, tab detection, and AI-generated integrity reports keeping your assessments fair and secure.
        </p>

        <div style={{ display: "flex", gap: "16px", marginBottom: "48px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/login"
            onMouseEnter={() => setHovered("heroSignIn")}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "14px 28px", borderRadius: "8px",
              backgroundColor: hovered === "heroSignIn" ? "#1D4ED8" : "#2563EB",
              color: "#FFFFFF", fontWeight: 700, fontSize: "15px",
              textDecoration: "none", transition: "background-color 0.15s",
              boxShadow: "0 4px 12px rgba(37,99,235,0.15)",
            }}>
            Sign In
          </Link>
          <Link to="/register"
            onMouseEnter={() => setHovered("heroRegister")}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "14px 28px", borderRadius: "8px", border: "1px solid #0F172A",
              backgroundColor: hovered === "heroRegister" ? "#F1F5F9" : "#FFFFFF",
              color: "#0F172A", fontWeight: 700, fontSize: "15px",
              textDecoration: "none", transition: "background-color 0.15s",
            }}>
            Register
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
          {["Face Detection", "Tab Monitoring", "AI Reports"].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748B", fontWeight: 500 }}>
              <CheckCircle size={14} color="#16A34A" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", padding: "80px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
          Everything you need for secure exams
        </h2>
        <p style={{ textAlign: "center", color: "#64748B", fontSize: "14px", margin: "0 0 48px", fontWeight: 500 }}>
          Powered by face-api.js · Groq LLaMA 3 · FastAPI
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <Shield size={40} color="#2563EB" />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Face Monitoring</h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>Detects face absence and multiple faces in real-time using face-api.js running entirely in-browser.</p>
          </div>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <Monitor size={40} color="#2563EB" />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Tab & Focus Detection</h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>Instantly flags tab switches and window focus loss to prevent unauthorized assistance.</p>
          </div>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <Bot size={40} color="#2563EB" />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>AI Integrity Reports</h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>Groq-powered LLaMA 3 generates natural language summaries with risk level classification.</p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#F8FAFC", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", margin: "0 0 48px" }}>
            How it works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "48px", fontWeight: 800, color: "#2563EB", lineHeight: 1 }}>01</span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Admin Creates Exam</h3>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>Set exam title, duration, and add MCQ questions through the admin dashboard.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "48px", fontWeight: 800, color: "#2563EB", lineHeight: 1 }}>02</span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Student Takes Exam</h3>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>Student answers questions while face detection and tab monitoring run silently in the background.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "48px", fontWeight: 800, color: "#2563EB", lineHeight: 1 }}>03</span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Admin Reviews Report</h3>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>AI generates a complete integrity report with violation timeline and risk classification.</p>
            </div>
          </div>
        </div>
      </div>

      <footer
        style={{
          backgroundColor: "#0F172A",
          padding: "32px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Left - Logo */}
        <Logo size="sm" />

        {/* Center */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#94A3B8",
            fontSize: "13px",
            whiteSpace: "nowrap",
          }}
        >
          Built with FastAPI, React & Groq. © 2026 Exam Proctor AI.
        </div>

        {/* Right - GitHub */}
        <a
          href="https://github.com/Muhammad-Ahmed-Rayyan/exam-proctor-ai"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHovered("github")}
          onMouseLeave={() => setHovered(null)}
          style={{
            color: hovered === "github" ? "#FFFFFF" : "#94A3B8",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            transition: "color 0.15s",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </footer>
    </div>
  );
};

export default Landing;