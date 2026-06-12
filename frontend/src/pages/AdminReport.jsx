import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import api from "../utils/api";

/* ─── Style tokens ─────────────────────────────────────────────────────── */
const colors = {
  bg: "#f7f7fb",
  surface: "#ffffff",
  border: "#e4e7ec",
  primary: "#1c1c28",
  muted: "#667085",
  danger: "#b42318",
  accent: "#4f46e5",
};

const pageStyle = {
  minHeight: "100vh",
  padding: "32px",
  backgroundColor: colors.bg,
  fontFamily: "'Inter', system-ui, sans-serif",
};

const cardStyle = {
  backgroundColor: colors.surface,
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "20px",
  border: `1px solid ${colors.border}`,
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

const riskBadge = (level) => {
  const map = {
    Low:    { bg: "#dcfce7", color: "#166534" },
    Medium: { bg: "#fef9c3", color: "#854d0e" },
    High:   { bg: "#fee2e2", color: "#991b1b" },
  };
  const style = map[level] ?? { bg: "#f2f4f7", color: "#344054" };
  return {
    display: "inline-block",
    padding: "4px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    ...style,
  };
};

const backBtnStyle = {
  padding: "9px 18px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: colors.primary,
  color: "#fff",
  fontWeight: 600,
  fontSize: "13px",
  cursor: "pointer",
  marginBottom: "24px",
};

const timelineItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  padding: "12px 0",
  borderBottom: `1px solid ${colors.border}`,
};

const dotStyle = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: colors.accent,
  marginTop: "4px",
  flexShrink: 0,
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const formatType = (raw = "") =>
  raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/* ─── Component ─────────────────────────────────────────────────────────── */
const AdminReport = () => {
  const { examId, studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const examTitle = location.state?.examTitle ?? "Exam";

  const [report, setReport]         = useState(null);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

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
        setError(
          err?.response?.data?.detail ??
          "Failed to load the report. The report may not have been generated yet."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, studentId]);

  return (
    <div style={pageStyle}>
      {/* Back button */}
      <button style={backBtnStyle} type="button" onClick={() => navigate("/admin/dashboard")}>
        ← Back to Dashboard
      </button>

      {/* Page title */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
          {examTitle} — Student Report
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: colors.muted }}>
          Student ID: {studentId}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ ...cardStyle, color: colors.muted, textAlign: "center", padding: "48px" }}>
          <span style={{ fontSize: "32px" }}>⏳</span>
          <p style={{ marginTop: "12px" }}>Fetching report data…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ ...cardStyle, borderLeft: `4px solid ${colors.danger}` }}>
          <p style={{ margin: 0, color: colors.danger, fontWeight: 600 }}>Error</p>
          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#333" }}>{error}</p>
        </div>
      )}

      {/* Report content */}
      {!loading && !error && report && (
        <>
          {/* Summary card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: colors.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Risk Level
                </p>
                <span style={riskBadge(report.risk_level)}>
                  {report.risk_level ?? "Unknown"}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "12px", color: colors.muted }}>Total Violations</p>
                <p style={{ margin: "2px 0 0", fontSize: "28px", fontWeight: 800, color: colors.primary }}>
                  {report.total_violations ?? violations.length}
                </p>
              </div>
            </div>
            <hr style={{ border: "none", borderTop: `1px solid ${colors.border}`, margin: "16px 0" }} />
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: colors.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              AI-Generated Summary
            </p>
            <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.7, color: "#1e1e2e" }}>
              {report.ai_summary ?? "No summary available."}
            </p>
            {report.generated_at && (
              <p style={{ margin: "14px 0 0", fontSize: "12px", color: colors.muted }}>
                Generated: {formatTimestamp(report.generated_at)}
              </p>
            )}
          </div>

          {/* Violation timeline */}
          <div style={cardStyle}>
            <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: "15px" }}>
              Violation Timeline
              <span style={{ marginLeft: "8px", fontSize: "13px", color: colors.muted, fontWeight: 400 }}>
                ({violations.length} event{violations.length !== 1 ? "s" : ""})
              </span>
            </p>
            {violations.length === 0 ? (
              <p style={{ color: colors.muted, fontSize: "14px", margin: 0 }}>No violations recorded.</p>
            ) : (
              violations.map((v) => (
                <div key={v.id} style={timelineItemStyle}>
                  <div style={dotStyle} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                      {formatType(v.type)}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: colors.muted }}>
                      {formatTimestamp(v.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReport;