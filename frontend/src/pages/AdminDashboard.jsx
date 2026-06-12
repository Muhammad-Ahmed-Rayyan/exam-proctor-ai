import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

/* ─── Shared style tokens ──────────────────────────────────────────────── */
const colors = {
  bg: "#f7f7fb",
  surface: "#ffffff",
  border: "#e4e7ec",
  primary: "#1c1c28",
  primaryHover: "#2d2d3f",
  muted: "#667085",
  danger: "#b42318",
  accent: "#4f46e5",
  accentLight: "#eef2ff",
};

const containerStyle = {
  minHeight: "100vh",
  padding: "32px",
  backgroundColor: colors.bg,
  fontFamily: "'Inter', system-ui, sans-serif",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "28px",
};

const formCardStyle = {
  backgroundColor: colors.surface,
  borderRadius: "12px",
  padding: "20px 24px",
  marginBottom: "28px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: `1px solid ${colors.border}`,
};

const formRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  alignItems: "end",
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: `1px solid ${colors.border}`,
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  fontSize: "13px",
  color: colors.muted,
  fontWeight: 500,
};

const btn = (variant = "primary", extra = {}) => ({
  padding: "9px 16px",
  borderRadius: "8px",
  border: "none",
  fontWeight: 600,
  fontSize: "13px",
  cursor: "pointer",
  transition: "background 0.15s",
  ...(variant === "primary"
    ? { backgroundColor: colors.primary, color: "#fff" }
    : variant === "accent"
    ? { backgroundColor: colors.accent, color: "#fff" }
    : { backgroundColor: colors.accentLight, color: colors.accent }),
  ...extra,
});

const tableStyle = {
  width: "100%",
  backgroundColor: colors.surface,
  borderRadius: "12px",
  borderCollapse: "collapse",
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: `1px solid ${colors.border}`,
};

const th = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  color: colors.muted,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  backgroundColor: "#f9fafb",
  borderBottom: `1px solid ${colors.border}`,
};

const td = {
  padding: "13px 16px",
  fontSize: "14px",
  borderBottom: `1px solid ${colors.border}`,
  verticalAlign: "middle",
};

const expandedPanelStyle = {
  padding: "16px 20px",
  backgroundColor: "#f9faff",
  borderBottom: `1px solid ${colors.border}`,
};

const studentRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 14px",
  borderRadius: "8px",
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  marginBottom: "8px",
};

const badgeStyle = (count) => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
  backgroundColor: count === 0 ? "#dcfce7" : count < 5 ? "#fef9c3" : "#fee2e2",
  color: count === 0 ? "#166534" : count < 5 ? "#854d0e" : "#991b1b",
});

/* ─── Component ────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ title: "", duration_minutes: "", start_time: "" });
  const [error, setError] = useState("");

  // expandedExamId → null means no row expanded
  const [expandedExamId, setExpandedExamId] = useState(null);
  // students map: { [examId]: { loading, error, data } }
  const [studentsMap, setStudentsMap] = useState({});

  const loadExams = async () => {
    try {
      const res = await api.get("/exams/");
      setExams(res.data || []);
    } catch {
      setError("Unable to load exams right now.");
    }
  };

  useEffect(() => { loadExams(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        title: form.title,
        duration_minutes: Number(form.duration_minutes),
      };
      if (form.start_time) payload.start_time = new Date(form.start_time).toISOString();
      await api.post("/exams/", payload);
      setForm({ title: "", duration_minutes: "", start_time: "" });
      loadExams();
    } catch {
      setError("Unable to create exam. Please check the inputs.");
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleViewStudents = async (exam) => {
    const { id: examId } = exam;

    // Toggle collapse
    if (expandedExamId === examId) {
      setExpandedExamId(null);
      return;
    }

    setExpandedExamId(examId);

    // Skip fetch if already loaded
    if (studentsMap[examId]?.data) return;

    setStudentsMap((prev) => ({ ...prev, [examId]: { loading: true, error: null, data: null } }));
    try {
      const res = await api.get(`/violations/exam/${examId}/students`);
      setStudentsMap((prev) => ({
        ...prev,
        [examId]: { loading: false, error: null, data: res.data || [] },
      }));
    } catch {
      setStudentsMap((prev) => ({
        ...prev,
        [examId]: { loading: false, error: "Failed to load students.", data: null },
      }));
    }
  };

  const handleViewReport = (examId, studentId, examTitle) => {
    navigate(`/admin/report/${examId}/${studentId}`, {
      state: { examTitle },
    });
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>Admin Dashboard</h2>
          <p style={{ margin: "4px 0 0", color: colors.muted, fontSize: "14px" }}>
            Create exams and review student violation reports.
          </p>
        </div>
        <button style={btn("primary")} onClick={handleLogout} type="button">
          Logout
        </button>
      </div>

      {/* Create Exam Form */}
      <div style={formCardStyle}>
        <p style={{ margin: "0 0 14px", fontWeight: 600, fontSize: "15px" }}>Create New Exam</p>
        <form style={formRowStyle} onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Title
            <input style={inputStyle} type="text" name="title" value={form.title}
              onChange={handleChange} placeholder="e.g. Midterm CS101" required />
          </label>
          <label style={labelStyle}>
            Duration (minutes)
            <input style={inputStyle} type="number" name="duration_minutes"
              value={form.duration_minutes} onChange={handleChange} placeholder="60" min="1" required />
          </label>
          <label style={labelStyle}>
            Start Time (optional)
            <input style={inputStyle} type="datetime-local" name="start_time"
              value={form.start_time} onChange={handleChange} />
          </label>
          <button style={btn("primary", { alignSelf: "flex-end" })} type="submit">
            + Create Exam
          </button>
        </form>
        {error && <p style={{ color: colors.danger, marginTop: "10px", fontSize: "13px" }}>{error}</p>}
      </div>

      {/* Exams Table */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={th}>Title</th>
            <th style={th}>Duration</th>
            <th style={th}>Status</th>
            <th style={th}>Start Time</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.length === 0 && (
            <tr>
              <td colSpan={5} style={{ ...td, textAlign: "center", color: colors.muted }}>
                No exams yet.
              </td>
            </tr>
          )}
          {exams.map((exam) => {
            const startTime = exam.start_time
              ? new Date(exam.start_time).toLocaleString()
              : "Not scheduled";
            const isExpanded = expandedExamId === exam.id;
            const slot = studentsMap[exam.id];

            return (
              <>
                <tr key={exam.id}>
                  <td style={{ ...td, fontWeight: 600 }}>{exam.title}</td>
                  <td style={td}>{exam.duration_minutes} min</td>
                  <td style={td}>
                    <span style={{
                      padding: "2px 10px", borderRadius: "999px", fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: exam.status === "active" ? "#dcfce7" : "#f2f4f7",
                      color: exam.status === "active" ? "#166534" : "#344054",
                    }}>
                      {exam.status ?? "—"}
                    </span>
                  </td>
                  <td style={{ ...td, color: colors.muted }}>{startTime}</td>
                  <td style={td}>
                    <button
                      style={btn(isExpanded ? "ghost" : "accent", { fontSize: "12px", padding: "7px 14px" })}
                      type="button"
                      onClick={() => handleViewStudents(exam)}
                    >
                      {isExpanded ? "▲ Hide Students" : "▼ View Students"}
                    </button>
                  </td>
                </tr>

                {/* Expandable student panel */}
                {isExpanded && (
                  <tr key={`${exam.id}-students`}>
                    <td colSpan={5} style={{ padding: 0 }}>
                      <div style={expandedPanelStyle}>
                        {slot?.loading && (
                          <p style={{ color: colors.muted, fontSize: "13px", margin: 0 }}>
                            Loading students…
                          </p>
                        )}
                        {slot?.error && (
                          <p style={{ color: colors.danger, fontSize: "13px", margin: 0 }}>
                            {slot.error}
                          </p>
                        )}
                        {slot?.data && slot.data.length === 0 && (
                          <p style={{ color: colors.muted, fontSize: "13px", margin: 0 }}>
                            No violation records found for this exam.
                          </p>
                        )}
                        {slot?.data?.map((student) => (
                          <div key={student.student_id} style={studentRowStyle}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                                {student.name}
                              </p>
                              <p style={{ margin: "2px 0 0", fontSize: "12px", color: colors.muted }}>
                                {student.email}
                              </p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                              <span style={badgeStyle(student.violation_count)}>
                                {student.violation_count} violation{student.violation_count !== 1 ? "s" : ""}
                              </span>
                              <button
                                style={btn("primary", { fontSize: "12px", padding: "7px 14px" })}
                                type="button"
                                onClick={() =>
                                  handleViewReport(exam.id, student.student_id, exam.title)
                                }
                              >
                                View Report
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;