import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../utils/api";

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

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div style={containerStyle}>
      <form style={cardStyle} onSubmit={handleSubmit}>
        <h2 style={{ margin: 0 }}>Create an account</h2>
        <label>
          Name
          <input
            style={inputStyle}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email
          <input
            style={inputStyle}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            style={inputStyle}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Role
          <select
            style={inputStyle}
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {error && <p style={{ color: "#b42318", margin: 0 }}>{error}</p>}
        <button style={buttonStyle} type="submit">
          Register
        </button>
        <p style={{ margin: 0 }}>
          Already have an account?{" "}
          <Link to="/login" style={linkStyle}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;