import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError]     = useState("");
  const [focused, setFocused] = useState(null);
  const [btnHover, setBtnHover] = useState(false);

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

  const inputStyle = (field) => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${focused === field ? C.primary : C.border}`,
    fontSize: "14px",
    outline: "none",
    color: C.text,
    backgroundColor: C.surface,
    transition: "border-color 0.15s",
    marginTop: "6px",
    display: "block",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)" }}>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: C.surface,
          padding: "40px 36px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(79,70,229,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: "4px" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎓</div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: C.text, margin: 0 }}>Create an account</h2>
          <p style={{ color: C.muted, fontSize: "14px", marginTop: "6px" }}>Join Exam Proctor AI today</p>
        </div>

        {/* Name */}
        <label style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
          Full Name
          <input
            style={inputStyle("name")}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            placeholder="Jane Doe"
            required
          />
        </label>

        {/* Email */}
        <label style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
          Email address
          <input
            style={inputStyle("email")}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            placeholder="you@example.com"
            required
          />
        </label>

        {/* Password */}
        <label style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
          Password
          <input
            style={inputStyle("password")}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            placeholder="••••••••"
            required
          />
        </label>

        {/* Role */}
        <label style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
          Role
          <select
            style={inputStyle("role")}
            name="role"
            value={form.role}
            onChange={handleChange}
            onFocus={() => setFocused("role")}
            onBlur={() => setFocused(null)}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {error && (
          <p style={{ color: C.danger, fontSize: "13px", margin: 0, padding: "10px 14px",
            backgroundColor: "#FEF2F2", borderRadius: "8px", border: "1px solid #FECACA" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            padding: "13px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: btnHover ? C.primaryD : C.primary,
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            cursor: "pointer",
            transition: "background 0.15s",
            width: "100%",
          }}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
        >
          Create Account
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", color: C.muted, margin: 0 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: C.primary, fontWeight: 600, textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;