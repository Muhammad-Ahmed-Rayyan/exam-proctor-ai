import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const warningMessages = {
  face_missing: "⚠️ Warning: Face not detected. Please stay in frame.",
  multiple_faces: "⚠️ Warning: Multiple faces detected.",
  tab_switch: "⚠️ Warning: Tab switch detected.",
  focus_loss: "⚠️ Warning: Please stay focused on the exam.",
};

const ExamRoom = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialExam = location.state?.exam;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectionRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const timerRef = useRef(null);
  const lastPostRef = useRef({});
  const processingRef = useRef(false);

  const [exam, setExam] = useState(
    initialExam && initialExam.id === id ? initialExam : null
  );
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [warning, setWarning] = useState("");
  const [webcamError, setWebcamError] = useState("");
  const [examError, setExamError] = useState("");

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
      await api.post("/violations/", {
        student_id: user.user_id,
        exam_id: id,
        type,
      });
    } catch (err) {}
  };

  const triggerViolation = (type) => {
    triggerWarning(type);
    postViolation(type);
  };

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
      if (!window.FaceDetection) {
        setTimeout(initFaceDetection, 500);
        return;
      }

      const faceDetection = new window.FaceDetection({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });

      faceDetection.setOptions({
        modelSelection: 0,
        minDetectionConfidence: 0.5,
      });

      faceDetection.onResults((results) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const detections = results.detections || [];
        const faceCount = detections.length;

        if (faceCount === 0) triggerViolation("face_missing");
        else if (faceCount >= 2) triggerViolation("multiple_faces");

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#22c55e";
        detections.forEach((detection) => {
          const box = detection.locationData?.relativeBoundingBox;
          if (!box) return;
          const x = box.xMin * canvas.width;
          const y = box.yMin * canvas.height;
          const w = box.width * canvas.width;
          const h = box.height * canvas.height;
          ctx.strokeRect(x, y, w, h);
        });
      });

      faceDetectionRef.current = faceDetection;

      detectionIntervalRef.current = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || processingRef.current) return;
        try {
          processingRef.current = true;
          await faceDetection.send({ image: video });
        } finally {
          processingRef.current = false;
        }
      }, 2000);
    };

    initFaceDetection();

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (faceDetectionRef.current?.close) faceDetectionRef.current.close();
    };
  }, [webcamError]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) triggerViolation("tab_switch");
    };
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
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7fb" }}>
      {warning && (
        <div style={{
          backgroundColor: "#b42318", color: "#ffffff",
          padding: "12px 24px", textAlign: "center", fontWeight: 600,
        }}>
          {warning}
        </div>
      )}
      <div style={{ padding: "24px 32px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "24px",
        }}>
          <div>
            <h2 style={{ margin: 0 }}>{exam?.title || "Exam Session"}</h2>
            {examError && <p style={{ color: "#b42318", margin: "6px 0 0" }}>{examError}</p>}
          </div>
          <div style={{
            backgroundColor: "#ffffff", padding: "12px 16px",
            borderRadius: "10px", boxShadow: "0 8px 18px rgba(0,0,0,0.06)", fontWeight: 600,
          }}>
            Time Remaining: {formatTime(remainingSeconds)}
          </div>
        </div>

        <div style={{
          backgroundColor: "#ffffff", borderRadius: "12px", padding: "48px",
          minHeight: "50vh", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "20px", color: "#667085",
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
        }}>
          Exam in Progress
        </div>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <button onClick={handleSubmit} type="button" style={{
            padding: "12px 24px", borderRadius: "8px", border: "none",
            backgroundColor: "#1c1c28", color: "#ffffff", fontWeight: 600, cursor: "pointer",
          }}>
            Submit Exam
          </button>
        </div>
      </div>

      <div style={{
        position: "fixed", top: "24px", right: "24px",
        width: "260px", height: "195px", borderRadius: "12px",
        overflow: "hidden", backgroundColor: "#111827",
        boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
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
          {webcamError && (
            <div style={{
              position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.75)",
              color: "#ffffff", display: "flex", alignItems: "center",
              justifyContent: "center", padding: "12px",
              textAlign: "center", fontSize: "13px",
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