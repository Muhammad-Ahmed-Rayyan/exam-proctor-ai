import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getInitialUser = () => ({
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role"),
  user_id: localStorage.getItem("user_id"),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);

  const login = (token, role, user_id) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user_id", user_id);
    setUser({ token, role, user_id });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    setUser({ token: null, role: null, user_id: null });
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);