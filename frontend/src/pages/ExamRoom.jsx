import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as faceapi from "face-api.js";
import { Shield, Clock, AlertTriangle, CheckCircle, Loader2, FileText } from "lucide-react";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

/* ── Violation warning messages ───────────────────────────────────────── */
const warningMessages = {
  face_missing:   "Face not detected. Please stay in frame.",
  multiple_faces: "Multiple faces detected.",
  tab_switch:     "Tab switch detected.",
  focus_loss:     "Please stay focused on the exam.",
};

const ExamRoom = () => {
  const { id }     = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const initialExam = location.state?.exam;

  /* ── Refs ──────────────────────────────────────────────────────────── */
  const videoRef           = useRef(null);
  const canvasRef          = useRef(null);
  const streamRef          = useRef(null);
  const detectionIntervalRef = useRef(null);
  const warningTimeoutRef  = useRef(null);
  const timerRef           = useRef(null);
  const lastPostRef        = useRef({});
  const processingRef      = useRef(false);

  /* ── State ─────────────────────────────────────────────────────────── */
  const [exam, setExam]                   = useState(initialExam && initialExam.id === id ? initialExam : null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [warning, setWarning]             = useState("");
  const [webcamError, setWebcamError]     = useState("");
  const [examError, setExamError]         = useState("");
  const [faceCount, setFaceCount]         = useState(null);
  const [modelLoading, setModelLoading]   = useState(true);

  /* ── Quiz state (additive) ─────────────────────────────────────────── */
  const [questions, setQuestions]         = useState([]);
  const [answers, setAnswers]             = useState({});   // { [question_id]: selected_option }
  const [submitted, setSubmitted]         = useState(false);
  const [score, setScore]                 = useState(null);
  const [submitHover, setSubmitHover]     = useState(false);

  /* ── Violation helpers ─────────────────────────────────────────────── */
  const triggerWarning = (type) => {
    const message = warningMessages[type];
    if (!message) return;
    setWarning(message);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => setWarning(""), 3000);
  };

  const postViolation = async (type) => {
    const now = Date.now();
    const lastPosted = lastPostRef.current[type] || 0;
    if (now - lastPosted < 10000) return;
    lastPostRef.current[type] = now;
    if (!user?.user_id || !id) return;
    try {
      await api.post("/violations/", { student_id: user.user_id, exam_id: id, type });
    } catch (err) {}
  };

  const triggerViolation = (type) => { triggerWarning(type); postViolation(type); };

  /* ── Fetch exam details ───────────────────────────────────────────── */
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await api.get(`/exams/${id}`);
        setExam(response.data);
      } catch (err) {
        try {
          const response = await api.get("/exams/");
          const found = response.data?.find((item) => item.id === id);
          if (found) { setExam(found); return; }
          setExamError("Exam not found.");
        } catch {
          setExamError("Unable to load exam details.");
        }
      }
    };
    if (!exam && id) fetchExam();
  }, [exam, id]);

  /* ── Fetch questions (additive) ──────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/exams/${id}/questions`);
        setQuestions(res.data || []);
      } catch {
        // Non-fatal: quiz panel will just be empty
      }
    };
    fetchQuestions();
  }, [id]);

  /* ── Exam timer ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!exam?.duration_minutes) return;
    const totalSeconds = Number(exam.duration_minutes) * 60;
    setRemainingSeconds(totalSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [exam?.duration_minutes]);

  /* ── Webcam ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setWebcamError("Webcam access denied. Please enable your camera.");
      }
    };
    startWebcam();
  }, []);

  /* ── Face detection (face-api.js) ─────────────────────────────────── */
  useEffect(() => {
    if (webcamError) return;

    let cancelled = false;

    const initFaceDetection = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      } catch (err) {
        return;
      }

      if (cancelled) return;
      setModelLoading(false);

      detectionIntervalRef.current = setInterval(async () => {
        const video  = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2 || processingRef.current) return;

        try {
          processingRef.current = true;

          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          );

          if (cancelled) return;

          const count = detections.length;
          setFaceCount(count);

          if (count === 0)       triggerViolation("face_missing");
          else if (count >= 2)   triggerViolation("multiple_faces");

          canvas.width  = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.lineWidth   = 2;
          ctx.strokeStyle = "#22c55e";
          detections.forEach((det) => {
            const { x, y, width, height } = det.box;
            ctx.strokeRect(x, y, width, height);
          });
        } catch (_err) {
          // swallow per-frame errors
        } finally {
          processingRef.current = false;
        }
      }, 2000);
    };

    initFaceDetection();

    return () => {
      cancelled = true;
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [webcamError]);

  /* ── Tab switch / focus loss ──────────────────────────────────────── */
  useEffect(() => {
    const handleVisibility = () => { if (document.hidden) triggerViolation("tab_switch"); };
    const handleBlur = () => triggerViolation("focus_loss");
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  /* ── Cleanup ───────────────────────────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current)  clearTimeout(warningTimeoutRef.current);
      if (timerRef.current)           clearInterval(timerRef.current);
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ── Quiz answer handler (additive) ─────────────────────────────────── */
  const handleAnswer = async (questionId, selectedOption) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    try {
      await api.post("/answers/", {
        exam_id:         id,
        question_id:     questionId,
        selected_option: selectedOption,
      });
    } catch {
      // Auto-save failure is silent; local state already updated
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const res = await api.get(`/answers/${id}/score`);
      setScore(res.data);
    } catch {
      // Score fetch failed — submitted message still shows without score
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const timerColor =
    remainingSeconds !== null && remainingSeconds < 300
      ? "#DC2626"
      : remainingSeconds !== null && remainingSeconds < 600
      ? "#D97706"
      : "#2563EB";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>

      {warning && (
        <div style={{
          backgroundColor: "#DC2626",
          color: "#fff",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontWeight: 700,
          fontSize: "15px",
          animation: "slideDown 0.25s ease",
          boxShadow: "0 2px 8px rgba(220,38,38,0.35)",
          letterSpacing: "0.01em",
        }}>
          <AlertTriangle size={18} />
          <span>Warning: {warning}</span>
        </div>
      )}

      <div style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "0 32px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Logo size="sm" />
          <span style={{ width: "1px", height: "20px", backgroundColor: "#E2E8F0" }} />
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#0F172A" }}>
            {exam?.title ?? "Exam Session"}
          </span>
          {examError && (
            <span style={{ marginLeft: "12px", fontSize: "13px", color: "#DC2626" }}>
              {examError}
            </span>
          )}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 18px",
          borderRadius: "999px",
          border: `2px solid ${timerColor}`,
          backgroundColor: `${timerColor}12`,
        }}>
          <Clock size={16} color={timerColor} />
          <span style={{ fontWeight: 800, fontSize: "18px", color: timerColor, fontVariantNumeric: "tabular-nums" }}>
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </div>

      {/* ── Main two-column layout (status + quiz) ─────────────────── */}
      <div style={{
        padding: "28px 32px",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: questions.length > 0 ? "1fr 1fr" : "1fr",
        gap: "24px",
        alignItems: "start",
      }}>

        {/* ── Left: proctoring status + submit ─────────────────────── */}
        <div>

        <div style={{
          backgroundColor: modelLoading ? "#FEF9C3" : faceCount === 0 ? "#FEE2E2" : faceCount >= 2 ? "#FEE2E2" : "#DCFCE7",
          padding: "10px 16px",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "13px",
          marginBottom: "16px",
          color: modelLoading ? "#854D0E" : faceCount === 0 ? "#991B1B" : faceCount >= 2 ? "#991B1B" : "#166534",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          {modelLoading ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
              <span>Loading face detection model…</span>
            </>
          ) : faceCount === null ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
              <span>Starting detection…</span>
            </>
          ) : faceCount === 0 ? (
            <>
              <AlertTriangle size={16} />
              <span>No face detected</span>
            </>
          ) : faceCount === 1 ? (
            <>
              <CheckCircle size={16} />
              <span>Face detected</span>
            </>
          ) : (
            <>
              <AlertTriangle size={16} />
              <span>{faceCount} faces detected</span>
            </>
          )}
        </div>

        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          padding: "64px 48px",
          minHeight: "52vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <span style={{
              display: "inline-block",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#16A34A",
              animation: "pulse 1.8s ease-in-out infinite",
            }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Live Session
            </span>
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1E293B", margin: "0 0 10px" }}>
            Exam in Progress
          </h2>
          <p style={{ color: "#64748B", fontSize: "15px", maxWidth: "380px", lineHeight: 1.6 }}>
            Your session is being monitored. Stay in frame and keep this tab active.
            </p>
          </div>

          {/* Submit button */}
          <div style={{ marginTop: "28px", textAlign: "center" }}>
            {submitted ? (
              <div style={{
                padding: "20px 24px", borderRadius: "12px",
                backgroundColor: "#DCFCE7", border: "1px solid #BBF7D0",
                textAlign: "center",
              }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "#166534" }}>
                  {score
                    ? `Exam Submitted - Score: ${score.correct_answers}/${score.total_questions} (${score.score_percent}%)`
                    : "Exam Submitted"}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#166534" }}>
                  Your answers have been saved. You may now close this tab.
                </p>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                type="button"
                onMouseEnter={() => setSubmitHover(true)}
                onMouseLeave={() => setSubmitHover(false)}
                style={{
                  padding: "13px 36px", borderRadius: "8px", border: "none",
                  backgroundColor: submitHover ? "#1D4ED8" : "#2563EB", color: "#fff", fontWeight: 700,
                  fontSize: "15px", cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)", transition: "background 0.15s",
                }}
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Quiz panel (only rendered if questions exist) ──── */}
        {questions.length > 0 && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
            overflow: "hidden",
            maxHeight: "78vh",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Quiz header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #E2E8F0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#F8FAFC",
            }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#1E293B", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={16} /> Quiz
              </p>
              <span style={{
                fontSize: "12px", fontWeight: 600, padding: "3px 10px",
                borderRadius: "999px", backgroundColor: "#EFF6FF", color: "#2563EB",
              }}>
                {Object.keys(answers).length}/{questions.length} answered
              </span>
            </div>

            {/* Scrollable questions list */}
            <div style={{ overflowY: "auto", padding: "16px 20px", flex: 1 }}>
              {questions.map((q, idx) => {
                const selected  = answers[q.id];
                const isAnswered = !!selected;
                const optionMap = {
                  A: q.option_a, B: q.option_b,
                  C: q.option_c, D: q.option_d,
                };
                return (
                  <div
                    key={q.id}
                    style={{
                      marginBottom: idx < questions.length - 1 ? "20px" : 0,
                      paddingBottom: idx < questions.length - 1 ? "20px" : 0,
                      borderBottom: idx < questions.length - 1 ? "1px solid #E2E8F0" : "none",
                    }}
                  >
                    <p style={{
                      margin: "0 0 10px", fontSize: "13px", fontWeight: 700, color: "#1E293B",
                      display: "flex", alignItems: "flex-start", gap: "6px",
                    }}>
                      <span style={{
                        minWidth: "22px", height: "22px", borderRadius: "50%",
                        backgroundColor: isAnswered ? "#2563EB" : "#E2E8F0",
                        color: isAnswered ? "#fff" : "#64748B",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 800, flexShrink: 0, marginTop: "1px",
                      }}>
                        {isAnswered ? "✓" : idx + 1}
                      </span>
                      {q.question_text}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "28px" }}>
                      {["A", "B", "C", "D"].map((letter) => (
                        <label
                           key={letter}
                           style={{
                             display: "flex", alignItems: "center", gap: "8px",
                             padding: "7px 12px", borderRadius: "8px", cursor: submitted ? "not-allowed" : "pointer",
                             border: `1.5px solid ${selected === letter ? "#2563EB" : "#E2E8F0"}`,
                             backgroundColor: selected === letter ? "#EFF6FF" : "#FAFAFA",
                             transition: "all 0.12s",
                           }}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={letter}
                            checked={selected === letter}
                            onChange={() => handleAnswer(q.id, letter)}
                            disabled={submitted}
                            style={{ accentColor: "#2563EB", flexShrink: 0 }}
                          />
                          <span style={{
                            fontSize: "12px", fontWeight: 700,
                            color: selected === letter ? "#2563EB" : "#94A3B8",
                            minWidth: "14px",
                          }}>
                            {letter}
                          </span>
                          <span style={{ fontSize: "13px", color: selected === letter ? "#2563EB" : "#1E293B", fontWeight: selected === letter ? 600 : 400 }}>
                            {optionMap[letter]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        width: "240px",
        height: "180px",
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "#111827",
        boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
        border: "3px solid #FFFFFF",
        outline: "1px solid #E2E8F0",
      }}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <video ref={videoRef} autoPlay playsInline muted style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%", objectFit: "cover",
          }} />
          <canvas ref={canvasRef} style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
          }} />

          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "6px 10px",
            background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              backgroundColor: webcamError ? "#DC2626" : "#22c55e",
              display: "inline-block",
            }} />
            <span style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}>
              {webcamError ? "Camera Error" : "Camera Active"}
            </span>
          </div>

          {webcamError && (
            <div style={{
              position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.78)",
              color: "#fff", display: "flex", alignItems: "center",
              justifyContent: "center", padding: "12px",
              textAlign: "center", fontSize: "12px", lineHeight: 1.5,
            }}>
              {webcamError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamRoom;