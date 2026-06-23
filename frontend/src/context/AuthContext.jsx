import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getInitialUser = () => ({
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role"),
  user_id: localStorage.getItem("user_id"),
  email: localStorage.getItem("email"),
  name: localStorage.getItem("name"),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);

  const login = (token, role, user_id, email = "", name = "") => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user_id", user_id);
    if (email) {
      localStorage.setItem("email", email);
    }
    if (name) {
      localStorage.setItem("name", name);
    } else {
      localStorage.removeItem("name");
    }
    setUser({
      token,
      role,
      user_id,
      email: email || localStorage.getItem("email"),
      name: name || null,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    setUser({ token: null, role: null, user_id: null, email: null, name: null });
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);