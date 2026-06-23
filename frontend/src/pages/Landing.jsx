import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Monitor, Bot, CheckCircle } from "lucide-react";

import Logo from "../components/Logo";

const Landing = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>

      {/* ── SECTION 1 — Navbar (fixed at top) ────────────────────────── */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "0 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
      }}>
        <Logo size="sm" />
        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            to="/login"
            onMouseEnter={() => setHovered("navSignIn")}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              backgroundColor: hovered === "navSignIn" ? "#F1F5F9" : "#FFFFFF",
              color: "#0F172A",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
              transition: "background-color 0.15s",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            onMouseEnter={() => setHovered("navGetStarted")}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: hovered === "navGetStarted" ? "#1D4ED8" : "#2563EB",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
              transition: "background-color 0.15s",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── SECTION 2 — Hero (full viewport height minus navbar) ─────── */}
      <div style={{
        minHeight: "calc(100vh - 64px)",
        paddingTop: "144px", // 64px navbar + 80px hero padding top
        paddingBottom: "80px",
        paddingLeft: "24px",
        paddingRight: "24px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
          padding: "6px 14px",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: 600,
          marginBottom: "24px",
        }}>
          <Shield size={14} />
          <span>AI-Powered Proctoring Platform</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "56px",
          fontWeight: 800,
          color: "#0F172A",
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          margin: "0 0 20px",
          whiteSpace: "pre-line",
        }}>
          Exam Integrity,{"\n"}
          <span style={{ color: "#2563EB" }}>Powered by AI</span>
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: "18px",
          color: "#64748B",
          maxWidth: "560px",
          lineHeight: 1.7,
          margin: "0 0 40px",
        }}>
          Real-time face monitoring, tab detection, and AI-generated integrity reports — keeping your assessments fair and secure.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "48px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            to="/register"
            onMouseEnter={() => setHovered("heroStudent")}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "14px 28px",
              borderRadius: "8px",
              backgroundColor: hovered === "heroStudent" ? "#1D4ED8" : "#2563EB",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              transition: "background-color 0.15s",
              boxShadow: "0 4px 12px rgba(37,99,235,0.15)",
            }}
          >
            Start as Student
          </Link>
          <Link
            to="/login"
            onMouseEnter={() => setHovered("heroAdmin")}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "14px 28px",
              borderRadius: "8px",
              border: "1px solid #0F172A",
              backgroundColor: hovered === "heroAdmin" ? "#F1F5F9" : "#FFFFFF",
              color: "#0F172A",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              transition: "background-color 0.15s",
            }}
          >
            Admin Login
          </Link>
        </div>

        {/* Trust Line */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}>
          {[
            "Face Detection",
            "Tab Monitoring",
            "AI Reports"
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748B", fontWeight: 500 }}>
              <CheckCircle size={14} color="#16A34A" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 3 — Features (white background) ───────────────────── */}
      <div style={{
        backgroundColor: "#FFFFFF",
        padding: "80px 24px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: 800,
          color: "#0F172A",
          letterSpacing: "-0.02em",
          margin: "0 0 12px",
        }}>
          Everything you need for secure exams
        </h2>
        <p style={{
          textAlign: "center",
          color: "#64748B",
          fontSize: "14px",
          margin: "0 0 48px",
          fontWeight: 500,
        }}>
          Powered by face-api.js · Groq LLaMA 3 · FastAPI
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}>
          {/* Card 1 */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            <Shield size={40} color="#2563EB" />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
              Face Monitoring
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
              Detects face absence and multiple faces in real-time using face-api.js running entirely in-browser.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            <Monitor size={40} color="#2563EB" />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
              Tab & Focus Detection
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
              Instantly flags tab switches and window focus loss to prevent unauthorized assistance.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            <Bot size={40} color="#2563EB" />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
              AI Integrity Reports
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
              Groq-powered LLaMA 3 generates natural language summaries with risk level classification.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 4 — How it works (background #F8FAFC) ──────────────── */}
      <div style={{
        backgroundColor: "#F8FAFC",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: 800,
            color: "#0F172A",
            letterSpacing: "-0.02em",
            margin: "0 0 48px",
          }}>
            How it works
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
          }}>
            {/* Step 1 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "48px", fontWeight: 800, color: "#2563EB", lineHeight: 1 }}>01</span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Admin Creates Exam</h3>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                Set exam title, duration, and add MCQ questions through the admin dashboard.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "48px", fontWeight: 800, color: "#2563EB", lineHeight: 1 }}>02</span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Student Takes Exam</h3>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                Student answers questions while face detection and tab monitoring run silently in the background.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "48px", fontWeight: 800, color: "#2563EB", lineHeight: 1 }}>03</span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Admin Reviews Report</h3>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                AI generates a complete integrity report with violation timeline and risk classification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 5 — Footer ─────────────────────────────────────────── */}
      <footer style={{
        backgroundColor: "#0F172A",
        padding: "32px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <Logo size="sm" dark={true} />
        <span style={{ color: "#94A3B8", fontSize: "13px" }}>
          © 2026 Exam Proctor AI. Built with FastAPI, React & Groq.
        </span>
      </footer>

    </div>
  );
};

export default Landing;