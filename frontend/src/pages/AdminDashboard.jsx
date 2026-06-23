import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, ChevronDown, ChevronUp } from "lucide-react";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const C = {
  accent:  "#2563EB",
  accentH: "#1D4ED8",
  navy:    "#0F172A",
  bg:      "#F1F5F9",
  surface: "#FFFFFF",
  border:  "#E2E8F0",
  text:    "#0F172A",
  muted:   "#64748B",
  danger:  "#DC2626",
  success: "#16A34A",
};

const statusBadge = (status) => {
  const map = {
    active:    { bg: "#DCFCE7", color: "#16A34A" },
    upcoming:  { bg: "#EFF6FF", color: "#1D4ED8" },
    completed: { bg: "#F1F5F9", color: "#64748B" },
  };
  const s = map[status] ?? { bg: "#F1F5F9", color: "#64748B" };
  return { display: "inline-block", padding: "3px 10px", borderRadius: "999px",
    fontSize: "12px", fontWeight: 600, ...s };
};

const violationBadge = (count) => ({
  display: "inline-block",
  padding: "3px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
  backgroundColor: count === 0 ? "#DCFCE7" : count < 5 ? "#FEF9C3" : "#FEE2E2",
  color: count === 0 ? "#16A34A" : count < 5 ? "#854D0E" : "#991B1B",
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ title: "", duration_minutes: "", start_time: "" });
  const [error, setError] = useState("");
  const [expandedExamId, setExpandedExamId] = useState(null);
  const [studentsMap, setStudentsMap] = useState({});
  const [hovered, setHovered] = useState(null);

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
      const payload = { title: form.title, duration_minutes: Number(form.duration_minutes) };
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
    if (expandedExamId === examId) { setExpandedExamId(null); return; }
    setExpandedExamId(examId);
    if (studentsMap[examId]?.data) return;
    setStudentsMap((prev) => ({ ...prev, [examId]: { loading: true, error: null, data: null } }));
    try {
      const res = await api.get(`/violations/exam/${examId}/students`);
      setStudentsMap((prev) => ({ ...prev, [examId]: { loading: false, error: null, data: res.data || [] } }));
    } catch {
      setStudentsMap((prev) => ({ ...prev, [examId]: { loading: false, error: "Failed to load students.", data: null } }));
    }
  };

  const handleViewReport = (examId, studentId, examTitle) => {
    navigate(`/admin/report/${examId}/${studentId}`, { state: { examTitle } });
  };

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${C.border}`,
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    color: C.text,
  };

  const btnPrimary = (id) => ({
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: hovered === id ? C.accentH : C.accent,
    color: "#fff",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    transition: "background 0.15s",
    whiteSpace: "nowrap",
  });

  const btnGhost = (id) => ({
    padding: "8px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${C.border}`,
    backgroundColor: hovered === id ? "#F1F5F9" : C.surface,
    color: C.text,
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    transition: "background 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}>
        <Logo size="sm" />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", color: "#0F172A" }}>
            Hello, <strong style={{ color: "#0F172A" }}>{user?.name || ""}</strong>
          </span>
          <button
            type="button"
            onClick={() => navigate("/admin/create-exam")}
            style={{
              padding: "7px 14px", borderRadius: "8px", border: "none",
              backgroundColor: hovered === "create" ? C.accentH : C.accent,
              color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer",
              transition: "background 0.15s",
              display: "flex", alignItems: "center", gap: "5px",
            }}
            onMouseEnter={() => setHovered("create")}
            onMouseLeave={() => setHovered(null)}
          >
            <Plus size={14} /> Create Exam
          </button>
          <button
            onClick={handleLogout}
            type="button"
            style={{
              padding: "7px 16px", borderRadius: "8px",
              border: "1px solid #0F172A",
              backgroundColor: hovered === "logout" ? "#F1F5F9" : "#FFFFFF",
              color: "#0F172A", fontWeight: 600, fontSize: "13px", cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={() => setHovered("logout")}
            onMouseLeave={() => setHovered(null)}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 24px" }}>

        {/* ── Page title ────────────────────────────────────────────── */}
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: C.text, marginBottom: "6px" }}>
          Admin Dashboard
        </h1>
        <p style={{ color: C.muted, marginBottom: "32px", fontSize: "14px" }}>
          Create exams and review student violation reports.
        </p>

        {/* ── Create Exam card ──────────────────────────────────────── */}
        <div style={{
          backgroundColor: C.surface, borderRadius: "12px", padding: "28px 28px 24px",
          marginBottom: "32px", border: `1px solid ${C.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
        }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "20px" }}>
            ＋ Create New Exam
          </h2>
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            alignItems: "end",
          }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: C.text, display: "flex", flexDirection: "column", gap: "6px" }}>
              Exam Title
              <input style={inputStyle} type="text" name="title" value={form.title}
                onChange={handleChange} placeholder="e.g. Midterm CS101" required />
            </label>
            <label style={{ fontSize: "13px", fontWeight: 600, color: C.text, display: "flex", flexDirection: "column", gap: "6px" }}>
              Duration (minutes)
              <input style={inputStyle} type="number" name="duration_minutes"
                value={form.duration_minutes} onChange={handleChange} placeholder="60" min="1" required />
            </label>
            <label style={{ fontSize: "13px", fontWeight: 600, color: C.text, display: "flex", flexDirection: "column", gap: "6px" }}>
              Start Time (optional)
              <input style={inputStyle} type="datetime-local" name="start_time"
                value={form.start_time} onChange={handleChange} />
            </label>
            <button
              type="submit"
              style={{ ...btnPrimary("submit"), padding: "11px 18px", alignSelf: "flex-end" }}
              onMouseEnter={() => setHovered("submit")}
              onMouseLeave={() => setHovered(null)}
            >
              Create Exam
            </button>
          </form>
          {error && (
            <p style={{ color: C.danger, fontSize: "13px", marginTop: "14px", padding: "10px 14px",
              backgroundColor: "#FEF2F2", borderRadius: "8px", border: "1px solid #FECACA" }}>
              {error}
            </p>
          )}
        </div>

        {/* ── Exams table ───────────────────────────────────────────── */}
        <div style={{
          backgroundColor: C.surface, borderRadius: "12px", overflow: "hidden",
          border: `1px solid ${C.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC" }}>
                {["Title", "Duration", "Status", "Start Time", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px",
                    fontWeight: 700, color: C.muted, textTransform: "uppercase",
                    letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: C.muted, fontSize: "14px" }}>
                    No exams yet. Create one above.
                  </td>
                </tr>
              )}
              {exams.map((exam) => {
                const startTime = exam.start_time ? new Date(exam.start_time).toLocaleString() : "Not scheduled";
                const isExpanded = expandedExamId === exam.id;
                const slot = studentsMap[exam.id];
                const btnId = `view-${exam.id}`;
                return (
                  <>
                    <tr key={exam.id} style={{ borderBottom: isExpanded ? "none" : `1px solid ${C.border}` }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600, fontSize: "14px", color: C.text }}>
                        {exam.title}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "14px", color: C.muted }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Clock size={14} /> {exam.duration_minutes} min
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={statusBadge(exam.status)}>{exam.status ?? "—"}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: C.muted }}>{startTime}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          type="button"
                          style={{
                            ... (isExpanded ? btnGhost(btnId) : btnPrimary(btnId)),
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                          onClick={() => handleViewStudents(exam)}
                          onMouseEnter={() => setHovered(btnId)}
                          onMouseLeave={() => setHovered(null)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={14} /> Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} /> View Students
                            </>
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable student panel */}
                    {isExpanded && (
                      <tr key={`${exam.id}-students`}>
                        <td colSpan={5} style={{ padding: 0, borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ padding: "16px 20px", backgroundColor: "#F8FAFC" }}>
                            {slot?.loading && (
                              <p style={{ color: C.muted, fontSize: "13px", margin: 0 }}>Loading students…</p>
                            )}
                            {slot?.error && (
                              <p style={{ color: C.danger, fontSize: "13px", margin: 0 }}>{slot.error}</p>
                            )}
                            {slot?.data?.length === 0 && (
                              <p style={{ color: C.muted, fontSize: "13px", margin: 0 }}>
                                No violation records found for this exam.
                              </p>
                            )}
                            {slot?.data?.map((student) => {
                              const repBtnId = `rep-${student.student_id}`;
                              const initial = (student.name ?? "?")[0].toUpperCase();
                              return (
                                <div
                                  key={student.student_id}
                                  style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "12px 16px", borderRadius: "10px",
                                    backgroundColor: C.surface, border: `1px solid ${C.border}`,
                                    marginBottom: "8px", flexWrap: "wrap", gap: "10px",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    {/* Avatar */}
                                    <div style={{
                                      width: "38px", height: "38px", borderRadius: "50%",
                                      backgroundColor: "#EFF6FF", color: C.accent,
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontWeight: 800, fontSize: "15px", flexShrink: 0,
                                    }}>
                                      {initial}
                                    </div>
                                    <div>
                                      <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: C.text }}>
                                        {student.name}
                                      </p>
                                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: C.muted }}>
                                        {student.email}
                                      </p>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={violationBadge(student.violation_count)}>
                                      {student.violation_count} violation{student.violation_count !== 1 ? "s" : ""}
                                    </span>
                                    <button
                                      type="button"
                                      style={{ ...btnPrimary(repBtnId), fontSize: "12px", padding: "8px 14px" }}
                                      onClick={() => handleViewReport(exam.id, student.student_id, exam.title)}
                                      onMouseEnter={() => setHovered(repBtnId)}
                                      onMouseLeave={() => setHovered(null)}
                                    >
                                      View Report
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
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
      </main>
    </div>
  );
};

export default AdminDashboard;