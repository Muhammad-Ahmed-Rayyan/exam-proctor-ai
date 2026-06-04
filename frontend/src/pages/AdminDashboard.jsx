import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const formStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "12px",
  marginBottom: "24px",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d0d5dd",
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#1c1c28",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  borderCollapse: "collapse",
  overflow: "hidden",
  boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({
    title: "",
    duration_minutes: "",
    start_time: "",
  });
  const [error, setError] = useState("");

  const loadExams = async () => {
    try {
      const response = await api.get("/exams/");
      setExams(response.data || []);
    } catch (err) {
      setError("Unable to load exams right now.");
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        title: form.title,
        duration_minutes: Number(form.duration_minutes),
      };
      if (form.start_time) {
        payload.start_time = new Date(form.start_time).toISOString();
      }
      await api.post("/exams/", payload);
      setForm({ title: "", duration_minutes: "", start_time: "" });
      loadExams();
    } catch (err) {
      setError("Unable to create exam. Please check the inputs.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleViewReports = (examId) => {
    const studentId = window.prompt("Enter student ID to view report:");
    if (studentId) {
      navigate(`/admin/report/${examId}/${studentId}`);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <p style={{ margin: 0, color: "#667085" }}>
            Create exams and review reports.
          </p>
        </div>
        <button style={buttonStyle} onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
      <form style={formStyle} onSubmit={handleSubmit}>
        <input
          style={inputStyle}
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Exam title"
          required
        />
        <input
          style={inputStyle}
          type="number"
          name="duration_minutes"
          value={form.duration_minutes}
          onChange={handleChange}
          placeholder="Duration (minutes)"
          min="1"
          required
        />
        <input
          style={inputStyle}
          type="datetime-local"
          name="start_time"
          value={form.start_time}
          onChange={handleChange}
        />
        <button style={buttonStyle} type="submit">
          Create Exam
        </button>
      </form>
      {error && <p style={{ color: "#b42318" }}>{error}</p>}
      <table style={tableStyle}>
        <thead style={{ backgroundColor: "#f2f4f7" }}>
          <tr>
            <th style={{ padding: "12px", textAlign: "left" }}>Title</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Duration</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Start Time</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => {
            const startTime = exam.start_time
              ? new Date(exam.start_time).toLocaleString()
              : "Not scheduled";
            return (
              <tr key={exam.id}>
                <td style={{ padding: "12px" }}>{exam.title}</td>
                <td style={{ padding: "12px" }}>
                  {exam.duration_minutes} min
                </td>
                <td style={{ padding: "12px" }}>{exam.status}</td>
                <td style={{ padding: "12px" }}>{startTime}</td>
                <td style={{ padding: "12px" }}>
                  <button
                    style={{ ...buttonStyle, padding: "8px 12px" }}
                    type="button"
                    onClick={() => handleViewReports(exam.id)}
                  >
                    View Reports
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;