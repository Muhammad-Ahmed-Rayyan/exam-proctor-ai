import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../utils/api";

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
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: `1.5px solid ${C.border}`,
  fontSize: "14px",
  outline: "none",
  color: C.text,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const cardStyle = {
  backgroundColor: C.surface,
  borderRadius: "12px",
  padding: "28px",
  border: `1px solid ${C.border}`,
  boxShadow: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
  marginBottom: "24px",
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: C.text,
};

const OPTIONS = ["A", "B", "C", "D"];

const CreateExam = () => {
  const navigate = useNavigate();

  // ── Exam creation state ────────────────────────────────────────────────
  const [examForm, setExamForm]   = useState({ title: "", duration_minutes: "" });
  const [examError, setExamError] = useState("");
  const [createdExam, setCreatedExam] = useState(null);
  const [examHover, setExamHover] = useState(false);

  // ── Question form state ────────────────────────────────────────────────
  const [qForm, setQForm] = useState({
    question_text: "",
    option_a: "", option_b: "", option_c: "", option_d: "",
    correct_option: "A",
  });
  const [qError, setQError]   = useState("");
  const [qLoading, setQLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [addHover, setAddHover]   = useState(false);
  const [doneHover, setDoneHover] = useState(false);

  // ── Exam form handlers ─────────────────────────────────────────────────
  const handleExamChange = (e) => {
    const { name, value } = e.target;
    setExamForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setExamError("");
    try {
      const res = await api.post("/exams/", {
        title: examForm.title,
        duration_minutes: Number(examForm.duration_minutes),
      });
      setCreatedExam(res.data);
    } catch (err) {
      setExamError(err?.response?.data?.detail ?? "Failed to create exam. Check your inputs.");
    }
  };

  // ── Question form handlers ─────────────────────────────────────────────
  const handleQChange = (e) => {
    const { name, value } = e.target;
    setQForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setQError("");
    setQLoading(true);
    try {
      const res = await api.post(`/exams/${createdExam.id}/questions`, qForm);
      setQuestions((prev) => [...prev, res.data]);
      setQForm({ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A" });
    } catch (err) {
      setQError(err?.response?.data?.detail ?? "Failed to add question.");
    } finally {
      setQLoading(false);
    }
  };

  const optionLabel = (letter) => ({
    A: qForm.option_a, B: qForm.option_b,
    C: qForm.option_c, D: qForm.option_d,
  }[letter]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav style={{
        backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "0 32px", height: "60px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🛡️</span>
          <span style={{ fontWeight: 800, fontSize: "17px", color: C.text }}>Exam Proctor AI</span>
          <span style={{ color: C.border, margin: "0 6px" }}>›</span>
          <span style={{ color: C.muted, fontSize: "14px" }}>Create Exam</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          style={{
            padding: "8px 16px", borderRadius: "8px", border: `1.5px solid ${C.border}`,
            backgroundColor: C.surface, color: C.text, fontWeight: 600, fontSize: "13px", cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 24px" }}>

        {/* ── Step 1: Create Exam ────────────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: C.text, margin: "0 0 20px" }}>
            Step 1 — Exam Details
          </h2>

          {createdExam ? (
            <div style={{
              padding: "14px 18px", borderRadius: "8px",
              backgroundColor: "#DCFCE7", border: "1px solid #BBF7D0",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ fontSize: "18px" }}>✅</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#166534", fontSize: "14px" }}>
                  Exam created: &ldquo;{createdExam.title}&rdquo;
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#166534" }}>
                  {createdExam.duration_minutes} min · ID: {createdExam.id}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleExamSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={labelStyle}>
                Exam Title
                <input style={inputStyle} type="text" name="title" value={examForm.title}
                  onChange={handleExamChange} placeholder="e.g. Midterm CS101" required />
              </label>
              <label style={labelStyle}>
                Duration (minutes)
                <input style={inputStyle} type="number" name="duration_minutes"
                  value={examForm.duration_minutes} onChange={handleExamChange}
                  placeholder="60" min="1" required />
              </label>
              {examError && (
                <p style={{ color: C.danger, fontSize: "13px", margin: 0, padding: "10px 14px",
                  backgroundColor: "#FEF2F2", borderRadius: "8px", border: "1px solid #FECACA" }}>
                  {examError}
                </p>
              )}
              <button
                type="submit"
                style={{
                  padding: "11px 24px", borderRadius: "8px", border: "none", alignSelf: "flex-start",
                  backgroundColor: examHover ? C.primaryD : C.primary,
                  color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={() => setExamHover(true)}
                onMouseLeave={() => setExamHover(false)}
              >
                Create Exam →
              </button>
            </form>
          )}
        </div>

        {/* ── Step 2: Add Questions (only shown after exam created) ──── */}
        {createdExam && (
          <>
            <div style={cardStyle}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: C.text, margin: "0 0 20px" }}>
                Step 2 — Add Questions
              </h2>

              <form onSubmit={handleAddQuestion} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Question text */}
                <label style={labelStyle}>
                  Question
                  <textarea
                    name="question_text"
                    value={qForm.question_text}
                    onChange={handleQChange}
                    placeholder="Enter the question here…"
                    required
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                  />
                </label>

                {/* Options A–D */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { letter: "A", name: "option_a" },
                    { letter: "B", name: "option_b" },
                    { letter: "C", name: "option_c" },
                    { letter: "D", name: "option_d" },
                  ].map(({ letter, name }) => (
                    <label key={letter} style={labelStyle}>
                      Option {letter}
                      <input
                        style={inputStyle}
                        type="text"
                        name={name}
                        value={qForm[name]}
                        onChange={handleQChange}
                        placeholder={`Option ${letter}`}
                        required
                      />
                    </label>
                  ))}
                </div>

                {/* Correct option radio */}
                <div>
                  <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 600, color: C.text }}>
                    Correct Answer
                  </p>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {OPTIONS.map((letter) => (
                      <label
                        key={letter}
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
                          border: `2px solid ${qForm.correct_option === letter ? C.primary : C.border}`,
                          backgroundColor: qForm.correct_option === letter ? "#EEF2FF" : C.surface,
                          fontWeight: 600, fontSize: "13px",
                          color: qForm.correct_option === letter ? C.primary : C.text,
                          transition: "all 0.15s",
                        }}
                      >
                        <input
                          type="radio"
                          name="correct_option"
                          value={letter}
                          checked={qForm.correct_option === letter}
                          onChange={handleQChange}
                          style={{ accentColor: C.primary }}
                        />
                        {letter}
                      </label>
                    ))}
                  </div>
                </div>

                {qError && (
                  <p style={{ color: C.danger, fontSize: "13px", margin: 0, padding: "10px 14px",
                    backgroundColor: "#FEF2F2", borderRadius: "8px", border: "1px solid #FECACA" }}>
                    {qError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={qLoading}
                  style={{
                    padding: "11px 24px", borderRadius: "8px", border: "none", alignSelf: "flex-start",
                    backgroundColor: addHover && !qLoading ? C.primaryD : C.primary,
                    color: "#fff", fontWeight: 700, fontSize: "14px",
                    cursor: qLoading ? "not-allowed" : "pointer",
                    opacity: qLoading ? 0.7 : 1, transition: "background 0.15s",
                  }}
                  onMouseEnter={() => setAddHover(true)}
                  onMouseLeave={() => setAddHover(false)}
                >
                  {qLoading ? "Adding…" : "+ Add Question"}
                </button>
              </form>
            </div>

            {/* ── Added questions list ─────────────────────────────── */}
            {questions.length > 0 && (
              <div style={cardStyle}>
                <p style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: 700, color: C.muted,
                  textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Questions Added ({questions.length})
                </p>
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    style={{
                      padding: "16px", borderRadius: "10px", border: `1px solid ${C.border}`,
                      backgroundColor: "#FAFAFA", marginBottom: i < questions.length - 1 ? "12px" : 0,
                    }}
                  >
                    <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: "14px", color: C.text }}>
                      Q{i + 1}. {q.question_text}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {OPTIONS.map((letter) => {
                        const key = `option_${letter.toLowerCase()}`;
                        const isCorrect = q.correct_option === letter;
                        return (
                          <div
                            key={letter}
                            style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              padding: "6px 10px", borderRadius: "6px",
                              backgroundColor: isCorrect ? "#DCFCE7" : "transparent",
                              border: isCorrect ? "1px solid #BBF7D0" : "1px solid transparent",
                            }}
                          >
                            <span style={{
                              width: "22px", height: "22px", borderRadius: "50%",
                              backgroundColor: isCorrect ? C.success : "#E2E8F0",
                              color: isCorrect ? "#fff" : C.muted,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "11px", fontWeight: 800, flexShrink: 0,
                            }}>
                              {letter}
                            </span>
                            <span style={{ fontSize: "13px", color: isCorrect ? "#166534" : C.text, fontWeight: isCorrect ? 700 : 400 }}>
                              {q[key]}
                              {isCorrect && <span style={{ marginLeft: "8px", fontSize: "12px" }}>✓ Correct</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Done button ──────────────────────────────────────── */}
            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                style={{
                  padding: "13px 40px", borderRadius: "8px", border: "none",
                  backgroundColor: doneHover ? C.primaryD : C.primary,
                  color: "#fff", fontWeight: 700, fontSize: "15px", cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(79,70,229,0.3)", transition: "background 0.15s",
                }}
                onMouseEnter={() => setDoneHover(true)}
                onMouseLeave={() => setDoneHover(false)}
              >
                Done — Back to Dashboard
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CreateExam;
