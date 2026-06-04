import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReport from "./pages/AdminReport";
import ExamRoom from "./pages/ExamRoom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user?.token || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user?.token || user?.role !== "student") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/student/dashboard"
      element={
        <StudentRoute>
          <StudentDashboard />
        </StudentRoute>
      }
    />
    <Route
      path="/student/exam/:id"
      element={
        <StudentRoute>
          <ExamRoom />
        </StudentRoute>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/report/:examId/:studentId"
      element={
        <AdminRoute>
          <AdminReport />
        </AdminRoute>
      }
    />
    <Route
      path="*"
      element={
        <ProtectedRoute>
          <Navigate to="/" replace />
        </ProtectedRoute>
      }
    />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;