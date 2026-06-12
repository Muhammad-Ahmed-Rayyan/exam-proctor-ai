import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const C = {
  primary:  "#4F46E5",
  primaryD: "#4338CA",
  bg:       "#F8FAFC",
  surface:  "#FFFFFF",
  border:   "#E2E8F0",
  text:     "#1E293B",
  muted:    "#64748B",
  danger:   "#DC2626",
  success:  "#16A34A",
  warning:  "#D97706",
};

const statusStyle = (status) => {
  const map = {
    active:    { bg: "#DCFCE7", color: C.success },
    upcoming:  { bg: "#EFF6FF", color: "#1D4ED8" },
    completed: { bg: "#F1F5F9", color: C.muted },
  };
  const s = map[status] ?? { bg: "#F1F5F9", color: C.muted };
  return {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    ...s,
  };
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      setError("");
      try {
        const response = await api.get("/exams/");
        setExams(response.data || []);
      } catch (err) {
        setError("Unable to load exams right now.");
      }
    };
    fetchExams();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        backgroundColor: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🛡️</span>
          <span style={{ fontWeight: 800, fontSize: "17px", color: C.text }}>Exam Proctor AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: C.muted }}>
            Hello, <strong style={{ color: C.text }}>{user?.name ?? "Student"}</strong>
          </span>
          <button
            onClick={handleLogout}
            type="button"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: `1.5px solid ${C.border}`,
              backgroundColor: hovered === "logout" ? "#F1F5F9" : C.surface,
              color: C.text,
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={() => setHovered("logout")}
            onMouseLeave={() => setHovered(null)}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: C.text, marginBottom: "6px" }}>
          Your Exams
        </h1>
        <p style={{ color: C.muted, marginBottom: "32px", fontSize: "14px" }}>
          Review available exams and start when you&apos;re ready.
        </p>

        {error && (
          <p style={{ color: C.danger, backgroundColor: "#FEF2F2", padding: "12px 16px",
            borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {/* Empty state */}
        {exams.length === 0 && !error && (
          <div style={{
            textAlign: "center",
            padding: "64px 24px",
            backgroundColor: C.surface,
            borderRadius: "12px",
            border: `1px solid ${C.border}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
            <p style={{ color: C.muted, fontSize: "16px" }}>No exams available at the moment.</p>
          </div>
        )}

        {/* Exam grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          {exams.map((exam) => {
            const startTime = exam.start_time
              ? new Date(exam.start_time).toLocaleString()
              : "Not scheduled";
            const isHovered = hovered === exam.id;
            return (
              <div
                key={exam.id}
                style={{
                  backgroundColor: C.surface,
                  borderRadius: "12px",
                  padding: "24px",
                  border: `1px solid ${isHovered ? "#C7D2FE" : C.border}`,
                  boxShadow: isHovered
                    ? "0 4px 20px rgba(79,70,229,0.12)"
                    : "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={() => setHovered(exam.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.text, margin: 0 }}>
                    {exam.title}
                  </h3>
                  <span style={statusStyle(exam.status)}>{exam.status ?? "—"}</span>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "999px",
                    backgroundColor: "#EEF2FF", color: C.primary, fontWeight: 600 }}>
                    ⏱ {exam.duration_minutes} min
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: C.muted, margin: 0 }}>
                  🗓 {startTime}
                </p>

                <Link
                  to={`/student/exam/${exam.id}`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "11px",
                    borderRadius: "8px",
                    backgroundColor: C.primary,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    textDecoration: "none",
                    marginTop: "4px",
                    transition: "background 0.15s",
                  }}
                >
                  Start Exam →
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;