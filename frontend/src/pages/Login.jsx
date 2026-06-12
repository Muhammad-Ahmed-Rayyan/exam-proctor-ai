import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [focused, setFocused]   = useState(null);
  const [btnHover, setBtnHover] = useState(false);

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: C.bg, padding: "24px",
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
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🛡️</div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: C.text, margin: 0 }}>Welcome back</h2>
          <p style={{ color: C.muted, fontSize: "14px", marginTop: "6px" }}>Sign in to your account</p>
        </div>

        {/* Email */}
        <label style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
          Email address
          <input
            style={inputStyle("email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            placeholder="••••••••"
            required
          />
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
          Sign In
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", color: C.muted, margin: 0 }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={{ color: C.primary, fontWeight: 600, textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;