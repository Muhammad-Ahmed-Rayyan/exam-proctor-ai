import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

/* ── Violation warning messages — unchanged ───────────────────────────── */
const warningMessages = {
  face_missing:   "⚠️ Warning: Face not detected. Please stay in frame.",
  multiple_faces: "⚠️ Warning: Multiple faces detected.",
  tab_switch:     "⚠️ Warning: Tab switch detected.",
  focus_loss:     "⚠️ Warning: Please stay focused on the exam.",
};

const ExamRoom = () => {
  const { id }     = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const initialExam = location.state?.exam;

  /* ── Refs — unchanged ──────────────────────────────────────────────── */
  const videoRef           = useRef(null);
  const canvasRef          = useRef(null);
  const streamRef          = useRef(null);
  const faceDetectionRef   = useRef(null);
  const detectionIntervalRef = useRef(null);
  const warningTimeoutRef  = useRef(null);
  const timerRef           = useRef(null);
  const lastPostRef        = useRef({});
  const processingRef      = useRef(false);

  /* ── State — unchanged ─────────────────────────────────────────────── */
  const [exam, setExam]                   = useState(initialExam && initialExam.id === id ? initialExam : null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [warning, setWarning]             = useState("");
  const [webcamError, setWebcamError]     = useState("");
  const [examError, setExamError]         = useState("");

  /* ── All logic — unchanged ─────────────────────────────────────────── */
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

  useEffect(() => {
    if (webcamError) return;
    const initFaceDetection = () => {
      if (!window.FaceDetection) { setTimeout(initFaceDetection, 500); return; }
      const faceDetection = new window.FaceDetection({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });
      faceDetection.setOptions({ modelSelection: 0, minDetectionConfidence: 0.5 });
      faceDetection.onResults((results) => {
        const canvas = canvasRef.current;
        const video  = videoRef.current;
        if (!canvas || !video) return;
        const ctx = canvas.getContext("2d");
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const detections = results.detections || [];
        const faceCount  = detections.length;
        if (faceCount === 0)  triggerViolation("face_missing");
        else if (faceCount >= 2) triggerViolation("multiple_faces");
        ctx.lineWidth   = 2;
        ctx.strokeStyle = "#22c55e";
        detections.forEach((detection) => {
          const box = detection.locationData?.relativeBoundingBox;
          if (!box) return;
          const x = box.xMin  * canvas.width;
          const y = box.yMin  * canvas.height;
          const w = box.width * canvas.width;
          const h = box.height * canvas.height;
          ctx.strokeRect(x, y, w, h);
        });
      });
      faceDetectionRef.current = faceDetection;
      detectionIntervalRef.current = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || processingRef.current) return;
        try { processingRef.current = true; await faceDetection.send({ image: video }); }
        finally { processingRef.current = false; }
      }, 2000);
    };
    initFaceDetection();
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (faceDetectionRef.current?.close) faceDetectionRef.current.close();
    };
  }, [webcamError]);

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

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current)  clearTimeout(warningTimeoutRef.current);
      if (timerRef.current)           clearInterval(timerRef.current);
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSubmit = () => navigate("/student/dashboard");

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  /* ── Timer color ────────────────────────────────────────────────────── */
  const timerColor =
    remainingSeconds !== null && remainingSeconds < 300
      ? "#DC2626"
      : remainingSeconds !== null && remainingSeconds < 600
      ? "#D97706"
      : "#4F46E5";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Warning banner (slide-in) ─────────────────────────────── */}
      {warning && (
        <div style={{
          backgroundColor: "#DC2626",
          color: "#fff",
          padding: "14px 24px",
          textAlign: "center",
          fontWeight: 700,
          fontSize: "15px",
          animation: "slideDown 0.25s ease",
          boxShadow: "0 2px 8px rgba(220,38,38,0.35)",
          letterSpacing: "0.01em",
        }}>
          {warning}
        </div>
      )}

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "0 32px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div>
          <span style={{ fontSize: "18px", marginRight: "8px" }}>🛡️</span>
          <span style={{ fontWeight: 800, fontSize: "16px", color: "#1E293B" }}>
            {exam?.title ?? "Exam Session"}
          </span>
          {examError && (
            <span style={{ marginLeft: "12px", fontSize: "13px", color: "#DC2626" }}>
              {examError}
            </span>
          )}
        </div>

        {/* Styled timer badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 18px",
          borderRadius: "999px",
          border: `2px solid ${timerColor}`,
          backgroundColor: `${timerColor}12`,
        }}>
          <span style={{ fontSize: "14px" }}>⏱</span>
          <span style={{ fontWeight: 800, fontSize: "18px", color: timerColor, fontVariantNumeric: "tabular-nums" }}>
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div style={{ padding: "28px 32px", maxWidth: "900px", margin: "0 auto" }}>

        {/* Exam-in-progress placeholder card */}
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
          {/* Pulsing dot */}
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
          <button
            onClick={handleSubmit}
            type="button"
            style={{
              padding: "13px 36px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#4F46E5",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
              transition: "background 0.15s",
            }}
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* ── Fixed webcam frame ────────────────────────────────────── */}
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

          {/* Camera label */}
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