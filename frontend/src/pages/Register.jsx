import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";

import api from "../utils/api";
import Logo from "../components/Logo";

const C = {
  accent:  "#2563EB",
  accentH: "#1D4ED8",
  bg:      "#F1F5F9",
  surface: "#FFFFFF",
  border:  "#E2E8F0",
  text:    "#0F172A",
  muted:   "#64748B",
  danger:  "#DC2626",
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError]       = useState("");
  const [focused, setFocused]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [backHover, setBackHover] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${focused === field ? C.accent : C.border}`,
    fontSize: "14px",
    outline: "none",
    color: C.text,
    backgroundColor: C.surface,
    transition: "border-color 0.15s",
    marginTop: "6px",
    display: "block",
    boxSizing: "border-box",
    fontFamily: "inherit",
  });

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.bg,
      padding: "24px",
      fontFamily: "'Inter', sans-serif",
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: C.surface,
          padding: "40px 36px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            background: "none",
            border: "none",
            color: backHover ? "#0F172A" : "#64748B",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: 0,
            alignSelf: "flex-start",
            transition: "color 0.15s",
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "4px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <Logo size="lg" />
          </div>
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
          disabled={loading}
          style={{
            padding: "13px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: loading ? "#93C5FD" : C.accent,
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.15s",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "inherit",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
              Creating account...
            </>
          ) : "Create Account"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", color: C.muted, margin: 0 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;