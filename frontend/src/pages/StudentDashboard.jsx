import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const containerStyle = {
  minHeight: "100vh",
  padding: "32px",
  backgroundColor: "#f7f7fb",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

const cardGridStyle = {
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#1c1c28",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  textAlign: "center",
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");

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
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Student Dashboard</h2>
          <p style={{ margin: 0, color: "#667085" }}>
            Review available exams and start when ready.
          </p>
        </div>
        <button style={buttonStyle} onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
      {error && <p style={{ color: "#b42318" }}>{error}</p>}
      <div style={cardGridStyle}>
        {exams.map((exam) => {
          const startTime = exam.start_time
            ? new Date(exam.start_time).toLocaleString()
            : "Not scheduled";
          return (
            <div key={exam.id} style={cardStyle}>
              <h3 style={{ margin: 0 }}>{exam.title}</h3>
              <p style={{ margin: 0 }}>Duration: {exam.duration_minutes} min</p>
              <p style={{ margin: 0 }}>Status: {exam.status}</p>
              <p style={{ margin: 0 }}>Start: {startTime}</p>
              <Link style={buttonStyle} to={`/student/exam/${exam.id}`}>
                Start Exam
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;