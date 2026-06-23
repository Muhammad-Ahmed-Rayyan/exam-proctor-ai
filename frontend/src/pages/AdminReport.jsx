import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import api from "../utils/api";

const C = {
  primary:  "#4F46E5",
  bg:       "#F8FAFC",
  surface:  "#FFFFFF",
  border:   "#E2E8F0",
  text:     "#1E293B",
  muted:    "#64748B",
  danger:   "#DC2626",
  success:  "#16A34A",
  warning:  "#D97706",
};

const riskConfig = {
  Low:    { bg: "#DCFCE7", color: "#16A34A", border: "#BBF7D0" },
  Medium: { bg: "#FEF9C3", color: "#D97706", border: "#FDE68A" },
  High:   { bg: "#FEE2E2", color: "#DC2626", border: "#FECACA" },
};

const formatType = (raw = "") =>
  raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const AdminReport = () => {
  const { examId, studentId } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();

  const examTitle = location.state?.examTitle ?? "Exam";

  const [report, setReport]         = useState(null);
  const [violations, setViolations] = useState([]);
  const [scoreData, setScoreData]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [btnHover, setBtnHover]     = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [reportRes, violationsRes] = await Promise.all([
          api.get(`/report/${examId}/${studentId}`),
          api.get(`/violations/${examId}/${studentId}`),
        ]);
        setReport(reportRes.data);
        setViolations(violationsRes.data || []);
      } catch (err) {
        setError(err?.response?.data?.detail ?? "Failed to load the report. It may not have been generated yet.");
      } finally {
        setLoading(false);
      }
      // Fetch score independently — never blocks report loading
      try {
        const scoreRes = await api.get(`/answers/${examId}/results/${studentId}`);
        setScoreData(scoreRes.data);
      } catch {
        // Fail silently — score card simply won't render
      }
    };
    fetchData();
  }, [examId, studentId]);

  const risk = report?.risk_level;
  const rc   = riskConfig[risk] ?? { bg: "#F1F5F9", color: C.muted, border: C.border };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Narrow top bar ─────────────────────────────────────────── */}
      <div style={{
        backgroundColor: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "0 32px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <span style={{ fontSize: "18px" }}>🛡️</span>
        <span style={{ fontWeight: 800, color: C.text, fontSize: "16px" }}>Exam Proctor AI</span>
        <span style={{ color: C.border, margin: "0 4px" }}>›</span>
        <span style={{ color: C.muted, fontSize: "14px" }}>Report</span>
      </div>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "36px 24px" }}>

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: `1.5px solid ${C.border}`,
            backgroundColor: btnHover ? "#F1F5F9" : C.surface,
            color: C.text,
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            marginBottom: "28px",
            transition: "background 0.15s",
          }}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
        >
          ← Back to Dashboard
        </button>

        {/* Page heading */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: C.text, margin: 0 }}>
            {examTitle}
          </h1>
          <p style={{ color: C.muted, fontSize: "13px", marginTop: "6px" }}>
            Student ID: {studentId}
          </p>
        </div>

        {/* Quiz Score card — shown immediately when scoreData is available */}
        {scoreData && (() => {
          const pct = scoreData.score_percent ?? 0;
          const sc = pct >= 70
            ? { bg: "#DCFCE7", color: "#166534", border: "#BBF7D0" }
            : pct >= 40
            ? { bg: "#FEF9C3", color: "#854D0E", border: "#FDE68A" }
            : { bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" };
          return (
            <div style={{
              backgroundColor: sc.bg,
              border: `1px solid ${sc.border}`,
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>
              <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700,
                color: sc.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Quiz Score
              </p>
              <p style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: sc.color }}>
                {scoreData.correct_answers} / {scoreData.total_questions} correct
                <span style={{ fontSize: "16px", fontWeight: 600, marginLeft: "10px" }}>
                  ({scoreData.score_percent}%)
                </span>
              </p>
            </div>
          );
        })()}

        {/* Loading */}
        {loading && (
          <div style={{
            backgroundColor: C.surface, borderRadius: "12px", padding: "60px",
            textAlign: "center", border: `1px solid ${C.border}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <p style={{ color: C.muted }}>Fetching report data…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            backgroundColor: "#FEF2F2", borderRadius: "12px", padding: "24px 28px",
            border: `1px solid #FECACA`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
          }}>
            <p style={{ fontWeight: 700, color: C.danger, marginBottom: "6px" }}>⚠ Report Unavailable</p>
            <p style={{ color: "#7F1D1D", fontSize: "14px", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Report content ───────────────────────────────────────── */}
        {!loading && !error && report && (
          <>
            {/* Stats row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}>
              {/* Risk badge card */}
              <div style={{
                backgroundColor: rc.bg,
                border: `1px solid ${rc.border}`,
                borderRadius: "12px",
                padding: "20px 24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: rc.color,
                  textTransform: "uppercase", letterSpacing: "0.07em" }}>Risk Level</p>
                <p style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: rc.color }}>
                  {risk ?? "—"}
                </p>
              </div>

              {/* Total violations card */}
              <div style={{
                backgroundColor: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "20px 24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: C.muted,
                  textTransform: "uppercase", letterSpacing: "0.07em" }}>Total Violations</p>
                <p style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: C.text }}>
                  {report.total_violations ?? violations.length}
                </p>
              </div>
            </div>

            {/* AI Summary card */}
            <div style={{
              backgroundColor: C.surface,
              borderRadius: "12px",
              padding: "24px 28px",
              marginBottom: "24px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
            }}>
              <p style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: 700, color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>
                🤖 AI-Generated Summary
              </p>
              <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.75, color: C.text }}>
                {report.ai_summary ?? "No summary available."}
              </p>
              {report.generated_at && (
                <p style={{ margin: "16px 0 0", fontSize: "12px", color: C.muted }}>
                  Generated: {formatTimestamp(report.generated_at)}
                </p>
              )}
            </div>

            {/* Violation timeline card */}
            <div style={{
              backgroundColor: C.surface,
              borderRadius: "12px",
              padding: "24px 28px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
            }}>
              <p style={{ margin: "0 0 18px", fontSize: "13px", fontWeight: 700, color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Violation Timeline
                <span style={{ marginLeft: "8px", textTransform: "none", fontWeight: 400, fontSize: "13px" }}>
                  ({violations.length} event{violations.length !== 1 ? "s" : ""})
                </span>
              </p>

              {violations.length === 0 ? (
                <p style={{ color: C.muted, fontSize: "14px" }}>No violations recorded.</p>
              ) : (
                violations.map((v, idx) => {
                  const isLast = idx === violations.length - 1;
                  return (
                    <div
                      key={v.id}
                      style={{
                        display: "flex",
                        gap: "16px",
                        paddingBottom: isLast ? 0 : "18px",
                        marginBottom: isLast ? 0 : "2px",
                        borderBottom: isLast ? "none" : `1px solid ${C.border}`,
                      }}
                    >
                      {/* Colored dot */}
                      <div style={{
                        width: "10px", height: "10px", borderRadius: "50%",
                        backgroundColor: C.primary, marginTop: "5px", flexShrink: 0,
                      }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: C.text }}>
                          {formatType(v.type)}
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: C.muted }}>
                          {formatTimestamp(v.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminReport;