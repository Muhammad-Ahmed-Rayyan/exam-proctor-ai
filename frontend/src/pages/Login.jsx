import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [focused, setFocused]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [backHover, setBackHover] = useState(false);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, role, user_id, name } = response.data;
      login(access_token, role, user_id, email, name);
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

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
              Signing in...
            </>
          ) : "Sign In"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", color: C.muted, margin: 0 }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;