import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f7f7fb",
  padding: "24px",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "32px",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  width: "100%",
  maxWidth: "420px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #d0d5dd",
  fontSize: "14px",
};

const buttonStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#1c1c28",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};

const linkStyle = {
  color: "#1c1c28",
  fontWeight: 600,
  textDecoration: "none",
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, role, user_id } = response.data;
      login(access_token, role, user_id);
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={containerStyle}>
      <form style={cardStyle} onSubmit={handleSubmit}>
        <h2 style={{ margin: 0 }}>Welcome back</h2>
        <label>
          Email
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            style={inputStyle}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p style={{ color: "#b42318", margin: 0 }}>{error}</p>}
        <button style={buttonStyle} type="submit">
          Login
        </button>
        <p style={{ margin: 0 }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={linkStyle}>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;