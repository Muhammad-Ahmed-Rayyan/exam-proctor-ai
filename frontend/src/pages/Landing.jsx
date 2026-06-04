import { Link } from "react-router-dom";

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "24px",
  gap: "18px",
  backgroundColor: "#f7f7fb",
  color: "#1c1c28",
};

const buttonRowStyle = {
  display: "flex",
  gap: "16px",
};

const buttonStyle = {
  padding: "12px 22px",
  borderRadius: "8px",
  border: "1px solid #1c1c28",
  textDecoration: "none",
  color: "#1c1c28",
  fontWeight: 600,
  backgroundColor: "#ffffff",
};

const Landing = () => (
  <div style={containerStyle}>
    <h1 style={{ fontSize: "40px", margin: 0 }}>Exam Proctor AI</h1>
    <p style={{ fontSize: "18px", margin: 0 }}>
      AI-powered exam integrity monitoring
    </p>
    <div style={buttonRowStyle}>
      <Link to="/login" style={buttonStyle}>
        Student Login
      </Link>
      <Link to="/login" style={buttonStyle}>
        Admin Login
      </Link>
    </div>
  </div>
);

export default Landing;